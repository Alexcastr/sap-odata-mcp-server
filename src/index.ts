import dotenv from 'dotenv';
dotenv.config();

import http from 'node:http';
import crypto from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SAPODataMCPServer } from './server.js';

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

  const wrapper = new SAPODataMCPServer();
  const server = wrapper.server;

  const httpTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
  });

  await server.connect(httpTransport);
  console.error("✅ HTTP transport successfully connected to MCP server.");

  const port = Number(process.env.PORT ?? 3007); // Coolify usa 3000 por defecto
  const httpServer = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Mcp-Session-Id');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    // --- AÑADIDO: LA RUTA PARA EL HEALTH CHECK ---
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('OK');
    }
    // --- FIN DEL AÑADIDO ---

    if (req.url === '/mcp' && ['GET', 'POST', 'DELETE'].includes(req.method!)) {
      let body: any;
      if (req.method === 'POST') {
        try {
          const buf = await getRawBody(req);
          body = buf.length > 0 ? JSON.parse(buf.toString()) : undefined;
        } catch {
          res.writeHead(400);
          return res.end('Invalid JSON');
        }
      }
      return httpTransport.handleRequest(req, res, body);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  httpServer.listen(port, () => {
    console.error(`🌐 Server listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start SAP OData MCP server:', err);
  process.exit(1);
});