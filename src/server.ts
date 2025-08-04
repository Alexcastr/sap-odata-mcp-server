// src/server.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions } from "./tool-definitions.js";
import { SAPODataHandlers } from "./handlers.js";

export class SAPODataMCPServer {
  public server: Server;
  private handlers: SAPODataHandlers;

  constructor() {
    // 1. Se crea la instancia del servidor MCP
    this.server = new Server(
      { name: "sap-odata-mcp-server", version: "0.1.0" },
      { capabilities: { tools: {} } }
    );

    // 2. Se crean los manejadores que contienen la lógica de las herramientas
    this.handlers = new SAPODataHandlers();
    
    // 3. Se registran todos los manejadores de solicitudes (initialize, listTools, callTool)
    this.setupToolHandlers();
    this.setupErrorHandling();
    console.log("SAPODataMCPServer instance created and handlers registered.");
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error("[MCP SERVER ERROR]", error);
  }

  private setupToolHandlers(): void {
    // Manejador para la inicialización de la sesión
    this.server.setRequestHandler(InitializeRequestSchema, async () => {
      console.log("Handler received: initialize");
      return {
        capabilities: { tools: { listChanged: true } }
      };
    });

    // Manejador para listar las herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log("Handler received: listTools");
      return {
        tools: toolDefinitions,
      };
    });

    // === EL MANEJADOR CLAVE PARA LAS LLAMADAS A HERRAMIENTAS ===
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // ¡¡AQUÍ ESTÁ LA CONFIRMACIÓN QUE NECESITAS!!
      // Si ves este log, significa que la solicitud llegó al lugar correcto.
      console.log(`✅✅✅ Handler received: callTool. Tool name: '${name}'`);

      try {
        // El switch que dirige a la función correcta en tus handlers
        switch (name) {
          case "sap_connect":
            return await this.handlers.handleConnect(args);
          case "sap_get_services":
            return await this.handlers.handleGetServices();
          case "sap_get_service_metadata":
            return await this.handlers.handleGetServiceMetadata(args);
          case "sap_query_entity_set":
            return await this.handlers.handleQueryEntitySet(args);
          case "sap_get_entity":
            return await this.handlers.handleGetEntity(args);
          case "sap_create_entity":
            return await this.handlers.handleCreateEntity(args);
          case "sap_update_entity":
            return await this.handlers.handleUpdateEntity(args);
          case "sap_delete_entity":
            return await this.handlers.handleDeleteEntity(args);
          case "sap_call_function":
            return await this.handlers.handleCallFunction(args);
          case "sap_connection_status":
            return await this.handlers.handleConnectionStatus();
          case "sap_disconnect":
            return await this.handlers.handleDisconnect();
          default:
            console.error(`❌ Tool not found in switch: ${name}`);
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`Error executing tool '${name}':`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Re-lanzamos el error para que el cliente MCP lo reciba
        throw new McpError(ErrorCode.InternalError, errorMessage);
      }
    });
  }

  // El método run() con StdioServerTransport ya no es necesario aquí.
  // La conexión será manejada por el servidor HTTP.
}