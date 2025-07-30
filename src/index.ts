// Carga las variables de entorno al inicio de todo
import dotenv from 'dotenv';
dotenv.config();

import http from 'node:http';
import crypto from 'node:crypto';
// Ya no importamos StdioServerTransport
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SAPODataMCPServer } from './server.js';

/**
 * Helper: lee todo el body de la petición y devuelve un Buffer
 */
function getRawBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function main() {
  console.error("🚀 Initializing SAP OData MCP Server for HTTP...");

  // Crea el servidor MCP
  const wrapper = new SAPODataMCPServer();
  const server = wrapper.server;

  // 1. Crear el único transporte que usaremos: HTTP
  const httpTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
  });

  // 2. Conectar el transporte HTTP al servidor. Es el único que existe ahora.
  await server.connect(httpTransport);
  console.error("✅ HTTP transport successfully connected to MCP server.");

  // 3. Crear el servidor HTTP que manejará las peticiones
  const port = Number(process.env.PORT ?? 8007);
  const httpServer = http.createServer(async (req, res) => {
    // Configuración de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Mcp-Session-Id');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    // Manejar solo peticiones a /mcp
    if (req.url === '/mcp' && ['GET', 'POST', 'DELETE'].includes(req.method!)) {
      let body: any;
      if (req.method === 'POST') {
        try {
          const buf = await getRawBody(req);
          // Permite un cuerpo vacío para ciertas peticiones
          body = buf.length > 0 ? JSON.parse(buf.toString()) : undefined;
        } catch {
          res.writeHead(400);
          return res.end('Invalid JSON');
        }
      }

      // Despacha la petición al transporte MCP
      return httpTransport.handleRequest(req, res, body);
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  // 4. Iniciar el servidor para que escuche peticiones
  httpServer.listen(port, () => {
    console.error(`🌐 Server listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start SAP OData MCP server:', err);
  process.exit(1);
});