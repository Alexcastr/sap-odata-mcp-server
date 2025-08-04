// src/server-http.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { SAPODataMCPServer } from './server.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: '*',
    exposedHeaders: ['Mcp-Session-Id'],
    allowedHeaders: ['Content-Type', 'mcp-session-id', 'Mcp-Session-Id'],
}));

const activeSessions: Record<string, {
    transport: StreamableHTTPServerTransport;
    serverWrapper: SAPODataMCPServer;
}> = {};

app.post('/mcp', async (req, res) => {
    try {
        const sessionIdHeader = req.headers['mcp-session-id'] || req.headers['Mcp-Session-Id'];
        const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader;

        console.log(`\n--- POST /mcp request received ---`);
        console.log(`Session ID from header: ${sessionId}`);
        console.log(`Request body:`, JSON.stringify(req.body, null, 2));

        let session = sessionId ? activeSessions[sessionId] : undefined;

        // CASO 1: Nueva sesión con initialize
        if (!session && req.body?.method === 'initialize') {
            console.log("-> Creating new session for initialize request...");

            const serverWrapper = new SAPODataMCPServer();
            let newSessionId: string | undefined;
            
            // Configuración simplificada del transporte
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => {
                    newSessionId = randomUUID();
                    return newSessionId;
                },
                onsessioninitialized: (sessionId) => {
                    console.log(`--> Session initialized with ID: ${sessionId}`);
                    activeSessions[sessionId] = { transport, serverWrapper };
                    
                    // Establecer header de respuesta
                    res.setHeader('Mcp-Session-Id', sessionId);
                },
            });

            // Manejo de cierre de sesión
            transport.onclose = () => {
                if (transport.sessionId) {
                    console.log(`-> Session ${transport.sessionId} closed`);
                    delete activeSessions[transport.sessionId];
                }
            };

            // Manejo de errores del transporte - más simple
            transport.onerror = (error) => {
                console.error('Transport error:', error);
            };

            try {
                // Conectar el servidor al transporte
                await serverWrapper.server.connect(transport);
                console.log("-> Server connected to transport successfully");
                
                // El transporte maneja completamente la solicitud y respuesta
                await transport.handleRequest(req, res, req.body);
                
            } catch (connectError) {
                console.error('Error connecting server to transport:', connectError);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: { 
                            code: -32603, 
                            message: 'Failed to initialize MCP server',
                            data: connectError instanceof Error ? connectError.message : String(connectError)
                        },
                        id: req.body?.id ?? null,
                    });
                }
            }

        // CASO 2: Sesión existente
        } else if (session) {
            console.log(`-> Using existing session ${sessionId}`);
            
            try {
                // Dejar que el transporte maneje completamente la request/response
                await session.transport.handleRequest(req, res, req.body);
                
            } catch (handleError) {
                console.error('Error handling request with existing session:', handleError);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: { 
                            code: -32603, 
                            message: 'Request processing error',
                            data: handleError instanceof Error ? handleError.message : String(handleError)
                        },
                        id: req.body?.id ?? null,
                    });
                }
            }

        // CASO 3: Sesión inválida o método no reconocido
        } else {
            console.error(`-> Invalid session or request. SessionId: '${sessionId}', Method: '${req.body?.method}'`);
            if (!res.headersSent) {
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: { 
                        code: -32000, 
                        message: 'Invalid or expired session. Please send an "initialize" request first.' 
                    },
                    id: req.body?.id ?? null,
                });
            }
        }
        
    } catch (globalError) {
        console.error('Global error in POST /mcp:', globalError);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: { 
                    code: -32603, 
                    message: 'Internal server error',
                    data: globalError instanceof Error ? globalError.message : String(globalError)
                },
                id: req.body?.id ?? null,
            });
        }
    }
});

// Manejador para GET y DELETE (SSE y cleanup)
const handleSubsequentRequests = async (req: express.Request, res: express.Response) => {
    try {
        const sessionIdHeader = req.headers['mcp-session-id'] || req.headers['Mcp-Session-Id'];
        const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader;

        console.log(`\n--- ${req.method} /mcp request ---`);
        console.log(`Session ID: ${sessionId}`);

        if (!sessionId || !activeSessions[sessionId]) {
            console.error(`Session ${sessionId} not found`);
            if (!res.headersSent) {
                res.status(404).json({
                    jsonrpc: '2.0',
                    error: { 
                        code: -32001, 
                        message: 'Session not found' 
                    },
                    id: null
                });
            }
            return;
        }

        const session = activeSessions[sessionId];
        
        // Dejar que el transporte maneje completamente la request
        await session.transport.handleRequest(req, res);
        
    } catch (error) {
        console.error(`Error in ${req.method} /mcp:`, error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error',
                    data: error instanceof Error ? error.message : String(error)
                },
                id: null
            });
        }
    }
};

app.get('/mcp', handleSubsequentRequests);
app.delete('/mcp', handleSubsequentRequests);

// Health check endpoint
app.get('/health', (_, res) => {
    res.status(200).json({ 
        status: 'OK', 
        activeSessions: Object.keys(activeSessions).length,
        sessions: Object.keys(activeSessions),
        timestamp: new Date().toISOString()
    });
});

// Cleanup endpoint para desarrollo
app.post('/cleanup', (_, res) => {
    console.log('Manual cleanup requested');
    Object.keys(activeSessions).forEach(sessionId => {
        try {
            activeSessions[sessionId].transport.close();
            delete activeSessions[sessionId];
        } catch (error) {
            console.error(`Error closing session ${sessionId}:`, error);
        }
    });
    res.json({ message: 'All sessions cleaned up', timestamp: new Date().toISOString() });
});

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    Object.keys(activeSessions).forEach(sessionId => {
        try {
            activeSessions[sessionId].transport.close();
        } catch (error) {
            console.error(`Error closing session ${sessionId}:`, error);
        }
    });
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const port = Number(process.env.PORT ?? 3007);
app.listen(port, () => {
    console.log(`\n✅ SAP OData MCP Server ready at http://localhost:${port}/mcp`);
    console.log(`Health check available at http://localhost:${port}/health`);
    console.log(`Cleanup endpoint available at http://localhost:${port}/cleanup`);
});