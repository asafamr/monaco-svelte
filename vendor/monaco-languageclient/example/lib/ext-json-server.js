"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const node_1 = require("vscode-jsonrpc/node");
const json_server_1 = require("./json-server");
const reader = new node_1.StreamMessageReader(process.stdin);
const writer = new node_1.StreamMessageWriter(process.stdout);
json_server_1.start(reader, writer);
//# sourceMappingURL=ext-json-server.js.map