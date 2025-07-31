import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { SAPODataMCPServer } from './server.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

const app = express();
app.use(express.json());

// --------- CORS para MCP Headers (requerido para browser/n8n/Claude) ----------
app.use(cors({
  origin: '*', // Cambia esto en producción si quieres restringir
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id', 'Mcp-Session-Id'],
}));
// -----------------------------------------------------------------------------


// ------- Session-aware transport map -------
const transports: Record<string, StreamableHTTPServerTransport> = {};

// MCP HTTP POST (inicia o reusa sesión)
app.post('/mcp', async (req, res) => {
  // Para Claude/n8n, header puede ser 'mcp-session-id' o 'Mcp-Session-Id'
  const sessionId = (req.headers['mcp-session-id'] || req.headers['Mcp-Session-Id']) as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // Nuevo transporte/session para este cliente
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
      },
      enableJsonResponse: true
    });

    // Cleanup cuando cierre la session
    transport.onclose = () => {
      if (transport.sessionId) delete transports[transport.sessionId];
    };

    // MCP Server de tu app
    const wrapper = new SAPODataMCPServer();
    await wrapper.server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

// MCP HTTP GET y DELETE (SSE/notifications/terminar sesión)
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = (req.headers['mcp-session-id'] || req.headers['Mcp-Session-Id']) as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};
app.get('/mcp', handleSessionRequest);
app.delete('/mcp', handleSessionRequest);

// Health endpoint opcional
app.get('/health', (_, res) => res.status(200).send('OK'));

// Arrancar
const port = Number(process.env.PORT ?? 3007);
app.listen(port, () => {
  console.error(`🌐 SAP OData MCP Server listening on http://localhost:${port}`);
});
