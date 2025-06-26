#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_js_1 = require("./server.js");
var server = new server_js_1.SAPODataMCPServer();
server.run().catch(console.error);
