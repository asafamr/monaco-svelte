"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const path = require("path");
const rpc = require("@codingame/monaco-jsonrpc");
const server = require("@codingame/monaco-jsonrpc/lib/server");
const lsp = require("vscode-languageserver");
const json_server_1 = require("./json-server");
function launch(socket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    const asExternalProccess = process.argv.findIndex(value => value === '--external') !== -1;
    if (asExternalProccess) {
        // start the language server as an external process
        const extJsonServerPath = path.resolve(__dirname, 'ext-json-server.js');
        const socketConnection = server.createConnection(reader, writer, () => socket.dispose());
        const serverConnection = server.createServerProcess('JSON', 'node', [extJsonServerPath]);
        server.forward(socketConnection, serverConnection, message => {
            if (rpc.isRequestMessage(message)) {
                if (message.method === lsp.InitializeRequest.type.method) {
                    const initializeParams = message.params;
                    initializeParams.processId = process.pid;
                }
            }
            return message;
        });
    }
    else {
        // start the language server inside the current process
        json_server_1.start(reader, writer);
    }
}
exports.launch = launch;
//# sourceMappingURL=json-server-launcher.js.map