"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAPODataMCPServer = void 0;
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var tool_definitions_js_1 = require("./tool-definitions.js");
var handlers_js_1 = require("./handlers.js");
var SAPODataMCPServer = /** @class */ (function () {
    function SAPODataMCPServer() {
        this.server = new index_js_1.Server({
            name: "sap-odata-mcp-server",
            version: "0.1.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.handlers = new handlers_js_1.SAPODataHandlers();
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    SAPODataMCPServer.prototype.setupErrorHandling = function () {
        var _this = this;
        this.server.onerror = function (error) { return console.error("[MCP Error]", error); };
        process.on("SIGINT", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handlers.handleDisconnect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.server.close()];
                    case 2:
                        _a.sent();
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    SAPODataMCPServer.prototype.setupToolHandlers = function () {
        var _this = this;
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        tools: tool_definitions_js_1.toolDefinitions,
                    }];
            });
        }); });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, name, args, _b, error_1, errorMessage;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = request.params, name = _a.name, args = _a.arguments;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 26, , 27]);
                        _b = name;
                        switch (_b) {
                            case "sap_connect": return [3 /*break*/, 2];
                            case "sap_get_services": return [3 /*break*/, 4];
                            case "sap_get_service_metadata": return [3 /*break*/, 6];
                            case "sap_query_entity_set": return [3 /*break*/, 8];
                            case "sap_get_entity": return [3 /*break*/, 10];
                            case "sap_create_entity": return [3 /*break*/, 12];
                            case "sap_update_entity": return [3 /*break*/, 14];
                            case "sap_delete_entity": return [3 /*break*/, 16];
                            case "sap_call_function": return [3 /*break*/, 18];
                            case "sap_connection_status": return [3 /*break*/, 20];
                            case "sap_disconnect": return [3 /*break*/, 22];
                        }
                        return [3 /*break*/, 24];
                    case 2: return [4 /*yield*/, this.handlers.handleConnect(args)];
                    case 3: return [2 /*return*/, _c.sent()];
                    case 4: return [4 /*yield*/, this.handlers.handleGetServices()];
                    case 5: return [2 /*return*/, _c.sent()];
                    case 6: return [4 /*yield*/, this.handlers.handleGetServiceMetadata(args)];
                    case 7: return [2 /*return*/, _c.sent()];
                    case 8: return [4 /*yield*/, this.handlers.handleQueryEntitySet(args)];
                    case 9: return [2 /*return*/, _c.sent()];
                    case 10: return [4 /*yield*/, this.handlers.handleGetEntity(args)];
                    case 11: return [2 /*return*/, _c.sent()];
                    case 12: return [4 /*yield*/, this.handlers.handleCreateEntity(args)];
                    case 13: return [2 /*return*/, _c.sent()];
                    case 14: return [4 /*yield*/, this.handlers.handleUpdateEntity(args)];
                    case 15: return [2 /*return*/, _c.sent()];
                    case 16: return [4 /*yield*/, this.handlers.handleDeleteEntity(args)];
                    case 17: return [2 /*return*/, _c.sent()];
                    case 18: return [4 /*yield*/, this.handlers.handleCallFunction(args)];
                    case 19: return [2 /*return*/, _c.sent()];
                    case 20: return [4 /*yield*/, this.handlers.handleConnectionStatus()];
                    case 21: return [2 /*return*/, _c.sent()];
                    case 22: return [4 /*yield*/, this.handlers.handleDisconnect()];
                    case 23: return [2 /*return*/, _c.sent()];
                    case 24: throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, "Unknown tool: ".concat(name));
                    case 25: return [3 /*break*/, 27];
                    case 26:
                        error_1 = _c.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, errorMessage);
                    case 27: return [2 /*return*/];
                }
            });
        }); });
    };
    SAPODataMCPServer.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transport = new stdio_js_1.StdioServerTransport();
                        return [4 /*yield*/, this.server.connect(transport)];
                    case 1:
                        _a.sent();
                        console.error("SAP OData MCP server running on stdio");
                        return [2 /*return*/];
                }
            });
        });
    };
    return SAPODataMCPServer;
}());
exports.SAPODataMCPServer = SAPODataMCPServer;
