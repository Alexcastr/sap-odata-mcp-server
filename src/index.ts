
import http from "node:http";
import crypto from "node:crypto";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SAPODataMCPServer } from "./server.js";

/**
 * Helper: lee todo el body de la petición y devuelve un Buffer
 */
function getRawBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function main() {
  // 1) Inicializa tu wrapper y extrae el Server base
  const wrapper = new SAPODataMCPServer();
  const server  = wrapper.server;

  // 2) Abre canal stdio (para debug local / extensiones)
  await server.connect(new StdioServerTransport());
  console.error("✅ SAP OData MCP server running on stdio");

  // 3) Monta tu propio servidor HTTP para Streamable HTTP/SSE
  const port = Number(process.env.PORT ?? 8007);

  // Configura el transport
  // const transport = new StreamableHTTPServerTransport({
  //   sessionIdGenerator: () => crypto.randomUUID(),
  //   enableJsonResponse: false,   // usa SSE por defecto
  //   // puedes pasar onsessioninitialized, eventStore, etc.
    
  // });

  // // Crea el HTTP server
  // const httpServer = http.createServer(async (req, res) => {
  //   // Sólo manejamos /mcp
  //   if (req.url === "/mcp" && ["POST","GET","DELETE"].includes(req.method!)) {
  //     let body: any = undefined;
  //     if (req.method === "POST") {
  //       // lee raw-body + parsea JSON
  //       const buf = await getRawBody(req);
  //       try {
  //         body = JSON.parse(buf.toString());
  //       } catch (err) {
  //         res.statusCode = 400;
  //         return res.end("Invalid JSON");
  //       }
  //     }
  //     // despacha al transport
  //     return transport.handleRequest(req, res, body);
  //   }
  //   // cualquier otro path: 404
  //   res.statusCode = 404;
  //   res.end();
  // });

  // // Arranca el HTTP server
  // httpServer.listen(port, () => {
  //   console.error(`🌐 SAP OData MCP HTTP/SSE listening on port ${port}`);
  // });

  // 4) Conecta el transport HTTP/SSE al MCP server
  // await server.connect(transport);
}

main().catch((err) => {
  console.error("❌ Failed to start SAP OData MCP server:", err);
  process.exit(1);
});
