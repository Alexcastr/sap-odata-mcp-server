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
exports.SAPODataHandlers = void 0;
var odata_client_js_1 = require("./odata-client.js");
var types_js_1 = require("./types.js");
var SAPODataHandlers = /** @class */ (function () {
    function SAPODataHandlers() {
        this.sapClient = null;
    }
    SAPODataHandlers.prototype.handleConnect = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var config, error_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!this.sapClient) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sapClient.disconnect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        config = types_js_1.SAPODataConfigSchema.parse(args);
                        this.sapClient = new odata_client_js_1.SAPODataClient(config);
                        return [4 /*yield*/, this.sapClient.connect()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Successfully connected to SAP OData service:\n- Base URL: ".concat(config.baseUrl, "\n- Username: ").concat(config.username, "\n- Client: ").concat(config.client || 'Not specified', "\n- CSRF Enabled: ").concat(config.enableCSRF),
                                    },
                                ],
                            }];
                    case 4:
                        error_1 = _a.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        throw new Error("Failed to connect to SAP OData service: ".concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleGetServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseText_1, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.getServices()];
                    case 3:
                        result = _a.sent();
                        responseText_1 = "Available SAP OData Services:\n\n";
                        if (result.services && result.services.length > 0) {
                            responseText_1 += "Found ".concat(result.services.length, " services:\n\n");
                            result.services.forEach(function (service, index) {
                                responseText_1 += "".concat(index + 1, ". ").concat(service.name, "\n");
                                if (service.title && service.title !== service.name) {
                                    responseText_1 += "   Title: ".concat(service.title, "\n");
                                }
                            });
                        }
                        else {
                            responseText_1 += "No OData services found.";
                        }
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText_1,
                                    },
                                ],
                                _rawData: result,
                            }];
                    case 4:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        throw new Error("Failed to get OData services: ".concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleGetServiceMetadata = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseText_2, error_3, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.getServiceMetadata(args.serviceName)];
                    case 3:
                        result = _a.sent();
                        responseText_2 = "SAP OData Service Metadata for ".concat(args.serviceName, ":\n\n");
                        if (result.entities && result.entities.length > 0) {
                            responseText_2 += "Entity Types (".concat(result.entities.length, "):\n");
                            result.entities.forEach(function (entity) {
                                responseText_2 += "\n- ".concat(entity.name, ":\n");
                                if (entity.properties && entity.properties.length > 0) {
                                    entity.properties.forEach(function (prop) {
                                        responseText_2 += "  \u2022 ".concat(prop.name, ": ").concat(prop.type).concat(prop.nullable ? '' : ' (required)', "\n");
                                    });
                                }
                            });
                        }
                        if (result.functions && result.functions.length > 0) {
                            responseText_2 += "\n\nFunction Imports (".concat(result.functions.length, "):\n");
                            result.functions.forEach(function (func) {
                                responseText_2 += "\n- ".concat(func.name);
                                if (func.returnType) {
                                    responseText_2 += " \u2192 ".concat(func.returnType);
                                }
                                responseText_2 += "\n";
                            });
                        }
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText_2,
                                    },
                                ],
                                _rawData: result,
                            }];
                    case 4:
                        error_3 = _a.sent();
                        errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                        throw new Error("Failed to get service metadata: ".concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleQueryEntitySet = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseText, records, records, queryParams, error_4, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.queryEntitySet(args.serviceName, args.entitySet, {
                                select: args.select,
                                filter: args.filter,
                                orderby: args.orderby,
                                top: args.top,
                                skip: args.skip,
                                expand: args.expand,
                            })];
                    case 3:
                        result = _a.sent();
                        responseText = "SAP OData Query Results for ".concat(args.serviceName, "/").concat(args.entitySet, ":\n\n");
                        if (result.d && result.d.results) {
                            records = result.d.results;
                            responseText += "Records found: ".concat(records.length, "\n\n");
                            if (records.length > 0) {
                                responseText += "Sample data (first ".concat(Math.min(3, records.length), " records):\n");
                                responseText += JSON.stringify(records.slice(0, 3), null, 2);
                                if (records.length > 3) {
                                    responseText += "\n\n... and ".concat(records.length - 3, " more records");
                                }
                            }
                        }
                        else if (result.value) {
                            records = result.value;
                            responseText += "Records found: ".concat(records.length, "\n\n");
                            if (records.length > 0) {
                                responseText += "Sample data (first ".concat(Math.min(3, records.length), " records):\n");
                                responseText += JSON.stringify(records.slice(0, 3), null, 2);
                                if (records.length > 3) {
                                    responseText += "\n\n... and ".concat(records.length - 3, " more records");
                                }
                            }
                        }
                        else {
                            responseText += "No data found matching the criteria.";
                        }
                        queryParams = [];
                        if (args.select)
                            queryParams.push("$select: ".concat(args.select.join(', ')));
                        if (args.filter)
                            queryParams.push("$filter: ".concat(args.filter));
                        if (args.orderby)
                            queryParams.push("$orderby: ".concat(args.orderby));
                        if (args.top)
                            queryParams.push("$top: ".concat(args.top));
                        if (args.skip)
                            queryParams.push("$skip: ".concat(args.skip));
                        if (args.expand)
                            queryParams.push("$expand: ".concat(args.expand.join(', ')));
                        if (queryParams.length > 0) {
                            responseText += "\n\nQuery parameters used:\n".concat(queryParams.join('\n'));
                        }
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText,
                                    },
                                ],
                                _rawData: result,
                            }];
                    case 4:
                        error_4 = _a.sent();
                        errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                        throw new Error("Failed to query entity set ".concat(args.entitySet, ": ").concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleGetEntity = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseText, error_5, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.getEntity(args.serviceName, args.entitySet, args.keyValues)];
                    case 3:
                        result = _a.sent();
                        responseText = "SAP OData Entity from ".concat(args.serviceName, "/").concat(args.entitySet, ":\n\n");
                        responseText += "Key values: ".concat(JSON.stringify(args.keyValues, null, 2), "\n\n");
                        responseText += "Entity data:\n".concat(JSON.stringify(result.d || result, null, 2));
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText,
                                    },
                                ],
                                _rawData: result,
                            }];
                    case 4:
                        error_5 = _a.sent();
                        errorMessage = error_5 instanceof Error ? error_5.message : String(error_5);
                        throw new Error("Failed to get entity: ".concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleCreateEntity = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseText, error_6, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.createEntity(args.serviceName, args.entitySet, args.data)];
                    case 3:
                        result = _a.sent();
                        responseText = "SAP OData Entity Created in ".concat(args.serviceName, "/").concat(args.entitySet, ":\n\n");
                        responseText += "Input data:\n".concat(JSON.stringify(args.data, null, 2), "\n\n");
                        responseText += "Created entity:\n".concat(JSON.stringify(result.d || result, null, 2));
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText,
                                    },
                                ],
                                _rawData: result,
                            }];
                    case 4:
                        error_6 = _a.sent();
                        errorMessage = error_6 instanceof Error ? error_6.message : String(error_6);
                        throw new Error("Failed to create entity: ".concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleUpdateEntity = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseText, error_7, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.updateEntity(args.serviceName, args.entitySet, args.keyValues, args.data)];
                    case 3:
                        result = _a.sent();
                        responseText = "SAP OData Entity Updated in ".concat(args.serviceName, "/").concat(args.entitySet, ":\n\n");
                        responseText += "Key values: ".concat(JSON.stringify(args.keyValues, null, 2), "\n\n");
                        responseText += "Update data: ".concat(JSON.stringify(args.data, null, 2), "\n\n");
                        responseText += "Update successful";
                        if (result && Object.keys(result).length > 0) {
                            responseText += "\n\nResponse: ".concat(JSON.stringify(result, null, 2));
                        }
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText,
                                    },
                                ],
                                _rawData: result,
                            }];
                    case 4:
                        error_7 = _a.sent();
                        errorMessage = error_7 instanceof Error ? error_7.message : String(error_7);
                        throw new Error("Failed to update entity: ".concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleDeleteEntity = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var responseText, error_8, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.deleteEntity(args.serviceName, args.entitySet, args.keyValues)];
                    case 3:
                        _a.sent();
                        responseText = "SAP OData Entity Deleted from ".concat(args.serviceName, "/").concat(args.entitySet, ":\n\n");
                        responseText += "Key values: ".concat(JSON.stringify(args.keyValues, null, 2), "\n\n");
                        responseText += "Entity successfully deleted";
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText,
                                    },
                                ],
                            }];
                    case 4:
                        error_8 = _a.sent();
                        errorMessage = error_8 instanceof Error ? error_8.message : String(error_8);
                        throw new Error("Failed to delete entity: ".concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleCallFunction = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var result, responseText, error_9, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 1:
                        if (!(_a.sent())) {
                            throw new Error("SAP OData connection lost. Please reconnect using sap_connect.");
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sapClient.callFunction(args.serviceName, args.functionName, args.parameters || {})];
                    case 3:
                        result = _a.sent();
                        responseText = "SAP OData Function Result for ".concat(args.serviceName, "/").concat(args.functionName, ":\n\n");
                        if (args.parameters && Object.keys(args.parameters).length > 0) {
                            responseText += "Parameters: ".concat(JSON.stringify(args.parameters, null, 2), "\n\n");
                        }
                        responseText += "Result:\n".concat(JSON.stringify(result, null, 2));
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: responseText,
                                    },
                                ],
                                _rawData: result,
                            }];
                    case 4:
                        error_9 = _a.sent();
                        errorMessage = error_9 instanceof Error ? error_9.message : String(error_9);
                        throw new Error("Failed to call function ".concat(args.functionName, ": ").concat(errorMessage));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleConnectionStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var isConnected, connectionInfo, statusText, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.sapClient) {
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: "text",
                                            text: "No SAP OData connection established. Use sap_connect to connect to an SAP OData service.",
                                        },
                                    ],
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.sapClient.isConnected()];
                    case 2:
                        isConnected = _a.sent();
                        connectionInfo = this.sapClient.getConnectionInfo();
                        statusText = "SAP OData Connection Status:\n\n";
                        statusText += "Status: ".concat(isConnected ? '✅ Connected' : '❌ Disconnected', "\n");
                        if (connectionInfo) {
                            statusText += "Base URL: ".concat(connectionInfo.baseUrl, "\n");
                            statusText += "Username: ".concat(connectionInfo.username, "\n");
                            statusText += "Client: ".concat(connectionInfo.client || 'Not specified', "\n");
                            statusText += "Timeout: ".concat(connectionInfo.timeout, "ms\n");
                            statusText += "CSRF Enabled: ".concat(connectionInfo.enableCSRF, "\n");
                            statusText += "CSRF Token: ".concat(connectionInfo.hasCSRFToken ? 'Available' : 'Not available', "\n");
                        }
                        if (!isConnected) {
                            statusText += "\nNote: Connection appears to be lost. Use sap_connect to reconnect.";
                        }
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: statusText,
                                    },
                                ],
                            }];
                    case 3:
                        error_10 = _a.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Error checking connection status: ".concat(error_10 instanceof Error ? error_10.message : String(error_10)),
                                    },
                                ],
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.handleDisconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_11, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.sapClient) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.sapClient.disconnect()];
                    case 2:
                        _a.sent();
                        this.sapClient = null;
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Successfully disconnected from SAP OData service",
                                    },
                                ],
                            }];
                    case 3:
                        error_11 = _a.sent();
                        errorMessage = error_11 instanceof Error ? error_11.message : String(error_11);
                        this.sapClient = null; // Force cleanup even if disconnect fails
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: "text",
                                        text: "Warning during disconnect: ".concat(errorMessage, "\nConnection has been cleared."),
                                    },
                                ],
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "No active SAP OData connection to disconnect",
                                },
                            ],
                        }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataHandlers.prototype.ensureConnected = function () {
        if (!this.sapClient) {
            throw new Error("Not connected to SAP OData service. Use sap_connect first.");
        }
    };
    return SAPODataHandlers;
}());
exports.SAPODataHandlers = SAPODataHandlers;
