"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SAPODataClient = void 0;
var axios_1 = require("axios");
var xml2js_1 = require("xml2js");
var util_1 = require("util");
var parseXML = (0, util_1.promisify)(xml2js_1.parseString);
var SAPODataClient = /** @class */ (function () {
    function SAPODataClient(config) {
        this.connected = false;
        this.csrfToken = null;
        this.cookies = [];
        this.config = config;
        this.httpClient = axios_1.default.create({
            baseURL: config.baseUrl,
            timeout: config.timeout,
            auth: {
                username: config.username,
                password: config.password,
            },
            headers: __assign({ 'Content-Type': 'application/json', 'Accept': 'application/json' }, (config.client && { 'sap-client': config.client })),
            httpsAgent: config.validateSSL ? undefined : { rejectUnauthorized: false },
        });
        this.setupInterceptors();
    }
    SAPODataClient.prototype.setupInterceptors = function () {
        var _this = this;
        // Add request interceptor for CSRF token and cookies
        this.httpClient.interceptors.request.use(function (config) {
            if (_this.csrfToken && config.method !== 'get') {
                config.headers['X-CSRF-Token'] = _this.csrfToken;
            }
            if (_this.cookies.length > 0) {
                config.headers['Cookie'] = _this.cookies.join('; ');
            }
            return config;
        });
        // Add response interceptor for CSRF token and cookie handling
        this.httpClient.interceptors.response.use(function (response) {
            // Extract CSRF token from response headers
            var csrfToken = response.headers['x-csrf-token'];
            if (csrfToken && csrfToken !== 'Required') {
                _this.csrfToken = csrfToken;
            }
            // Extract cookies from response
            var setCookies = response.headers['set-cookie'];
            if (setCookies) {
                _this.cookies = setCookies.map(function (cookie) { return cookie.split(';')[0]; });
            }
            return response;
        }, function (error) {
            var _a;
            // Handle 401 unauthorized
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                _this.connected = false;
                _this.csrfToken = null;
                _this.cookies = [];
            }
            return Promise.reject(error);
        });
    };
    SAPODataClient.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log("Connecting to SAP OData service at ".concat(this.config.baseUrl));
                        if (!this.config.enableCSRF) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.fetchCSRFToken()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Test connection by fetching service document
                    return [4 /*yield*/, this.httpClient.get('', {
                            headers: { 'Accept': 'application/xml' }
                        })];
                    case 3:
                        // Test connection by fetching service document
                        _a.sent();
                        this.connected = true;
                        console.log("Successfully connected to SAP OData service");
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        this.connected = false;
                        this.csrfToken = null;
                        this.cookies = [];
                        throw new Error("Failed to connect to SAP OData service: ".concat(this.getErrorMessage(error_1)));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.fetchCSRFToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.httpClient.get('', {
                                headers: {
                                    'X-CSRF-Token': 'Fetch',
                                    'Accept': 'application/xml'
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        // CSRF token fetch might fail on some systems, continue anyway
                        console.warn('Could not fetch CSRF token:', this.getErrorMessage(error_2));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.connected = false;
                this.csrfToken = null;
                this.cookies = [];
                console.log("Disconnected from SAP OData service");
                return [2 /*return*/];
            });
        });
    };
    SAPODataClient.prototype.isConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected)
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Test connection with a simple request
                        return [4 /*yield*/, this.httpClient.get('', {
                                headers: { 'Accept': 'application/xml' },
                                timeout: 5000
                            })];
                    case 2:
                        // Test connection with a simple request
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_3 = _a.sent();
                        this.connected = false;
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.getServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, parsed, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.httpClient.get('', {
                                headers: { 'Accept': 'application/xml' }
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, parseXML(response.data)];
                    case 3:
                        parsed = _a.sent();
                        return [2 /*return*/, this.extractServices(parsed)];
                    case 4:
                        error_4 = _a.sent();
                        throw new Error("Failed to get OData services: ".concat(this.getErrorMessage(error_4)));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.getServiceMetadata = function (serviceName) {
        return __awaiter(this, void 0, void 0, function () {
            var response, parsed, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.httpClient.get("".concat(serviceName, "/$metadata"), {
                                headers: { 'Accept': 'application/xml' }
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, parseXML(response.data)];
                    case 3:
                        parsed = _a.sent();
                        return [2 /*return*/, this.extractMetadata(parsed)];
                    case 4:
                        error_5 = _a.sent();
                        throw new Error("Failed to get service metadata: ".concat(this.getErrorMessage(error_5)));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.queryEntitySet = function (serviceName_1, entitySet_1) {
        return __awaiter(this, arguments, void 0, function (serviceName, entitySet, options) {
            var params, url, response, error_6;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        params = new URLSearchParams();
                        if (options.select && options.select.length > 0) {
                            params.append('$select', options.select.join(','));
                        }
                        if (options.filter) {
                            params.append('$filter', options.filter);
                        }
                        if (options.orderby) {
                            params.append('$orderby', options.orderby);
                        }
                        if (options.top) {
                            params.append('$top', options.top.toString());
                        }
                        if (options.skip) {
                            params.append('$skip', options.skip.toString());
                        }
                        if (options.expand && options.expand.length > 0) {
                            params.append('$expand', options.expand.join(','));
                        }
                        url = "".concat(serviceName, "/").concat(entitySet).concat(params.toString() ? '?' + params.toString() : '');
                        return [4 /*yield*/, this.httpClient.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_6 = _a.sent();
                        throw new Error("Failed to query entity set ".concat(entitySet, ": ").concat(this.getErrorMessage(error_6)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.getEntity = function (serviceName, entitySet, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var keyString, url, response, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        keyString = Object.entries(keyValues)
                            .map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return "".concat(key, "='").concat(encodeURIComponent(value), "'");
                        })
                            .join(',');
                        url = "".concat(serviceName, "/").concat(entitySet, "(").concat(keyString, ")");
                        return [4 /*yield*/, this.httpClient.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_7 = _a.sent();
                        throw new Error("Failed to get entity: ".concat(this.getErrorMessage(error_7)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.createEntity = function (serviceName, entitySet, data) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.httpClient.post("".concat(serviceName, "/").concat(entitySet), data)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_8 = _a.sent();
                        throw new Error("Failed to create entity: ".concat(this.getErrorMessage(error_8)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.updateEntity = function (serviceName, entitySet, keyValues, data) {
        return __awaiter(this, void 0, void 0, function () {
            var keyString, response, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        keyString = Object.entries(keyValues)
                            .map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return "".concat(key, "='").concat(encodeURIComponent(value), "'");
                        })
                            .join(',');
                        return [4 /*yield*/, this.httpClient.put("".concat(serviceName, "/").concat(entitySet, "(").concat(keyString, ")"), data)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_9 = _a.sent();
                        throw new Error("Failed to update entity: ".concat(this.getErrorMessage(error_9)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.deleteEntity = function (serviceName, entitySet, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var keyString, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        keyString = Object.entries(keyValues)
                            .map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return "".concat(key, "='").concat(encodeURIComponent(value), "'");
                        })
                            .join(',');
                        return [4 /*yield*/, this.httpClient.delete("".concat(serviceName, "/").concat(entitySet, "(").concat(keyString, ")"))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        throw new Error("Failed to delete entity: ".concat(this.getErrorMessage(error_10)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.callFunction = function (serviceName_1, functionName_1) {
        return __awaiter(this, arguments, void 0, function (serviceName, functionName, parameters) {
            var params_1, url, response, error_11;
            if (parameters === void 0) { parameters = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureConnected();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        params_1 = new URLSearchParams();
                        Object.entries(parameters).forEach(function (_a) {
                            var key = _a[0], value = _a[1];
                            params_1.append(key, String(value));
                        });
                        url = "".concat(serviceName, "/").concat(functionName).concat(params_1.toString() ? '?' + params_1.toString() : '');
                        return [4 /*yield*/, this.httpClient.get(url)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_11 = _a.sent();
                        throw new Error("Failed to call function ".concat(functionName, ": ").concat(this.getErrorMessage(error_11)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SAPODataClient.prototype.ensureConnected = function () {
        if (!this.connected) {
            throw new Error("Not connected to SAP OData service. Use sap_connect first.");
        }
    };
    SAPODataClient.prototype.extractServices = function (parsed) {
        var _a, _b;
        try {
            var workspace = (_a = parsed === null || parsed === void 0 ? void 0 : parsed.service) === null || _a === void 0 ? void 0 : _a.workspace;
            if (!workspace)
                return { services: [] };
            var collections = ((_b = workspace[0]) === null || _b === void 0 ? void 0 : _b.collection) || [];
            var services = collections.map(function (collection) { return ({
                name: collection.$.href,
                title: collection.$.title || collection.$.href
            }); });
            return { services: services };
        }
        catch (error) {
            return { services: [], raw: parsed };
        }
    };
    SAPODataClient.prototype.extractMetadata = function (parsed) {
        var _a, _b, _c, _d, _e, _f;
        try {
            var schema = (_d = (_c = (_b = (_a = parsed === null || parsed === void 0 ? void 0 : parsed['edmx:Edmx']) === null || _a === void 0 ? void 0 : _a['edmx:DataServices']) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.Schema) === null || _d === void 0 ? void 0 : _d[0];
            if (!schema)
                return { entities: [], functions: [] };
            var entityTypes = schema.EntityType || [];
            var functionImports = ((_f = (_e = schema.EntityContainer) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.FunctionImport) || [];
            var entities = entityTypes.map(function (entity) { return ({
                name: entity.$.Name,
                properties: (entity.Property || []).map(function (prop) { return ({
                    name: prop.$.Name,
                    type: prop.$.Type,
                    nullable: prop.$.Nullable !== 'false'
                }); })
            }); });
            var functions = functionImports.map(function (func) { return ({
                name: func.$.Name,
                returnType: func.$.ReturnType
            }); });
            return { entities: entities, functions: functions };
        }
        catch (error) {
            return { entities: [], functions: [], raw: parsed };
        }
    };
    SAPODataClient.prototype.getErrorMessage = function (error) {
        if (error.response) {
            return "HTTP ".concat(error.response.status, ": ").concat(error.response.statusText);
        }
        else if (error.request) {
            return "No response received from server";
        }
        else {
            return error.message || "Unknown error";
        }
    };
    SAPODataClient.prototype.getConnectionInfo = function () {
        return {
            connected: this.connected,
            baseUrl: this.config.baseUrl,
            username: this.config.username,
            client: this.config.client,
            timeout: this.config.timeout,
            enableCSRF: this.config.enableCSRF,
            hasCSRFToken: !!this.csrfToken
        };
    };
    return SAPODataClient;
}());
exports.SAPODataClient = SAPODataClient;
