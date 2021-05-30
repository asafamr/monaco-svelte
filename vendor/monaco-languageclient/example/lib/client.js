"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const monaco_jsonrpc_1 = require("@codingame/monaco-jsonrpc");
const monaco = require("monaco-editor-core");
const monaco_languageclient_1 = require("monaco-languageclient");
const normalizeUrl = require("normalize-url");
const ReconnectingWebSocket = require('reconnecting-websocket');
// register Monaco languages
monaco.languages.register({
    id: 'json',
    extensions: ['.json', '.bowerrc', '.jshintrc', '.jscsrc', '.eslintrc', '.babelrc'],
    aliases: ['JSON', 'json'],
    mimetypes: ['application/json'],
});
// create Monaco editor
const value = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": "unix"
}`;
monaco.editor.create(document.getElementById("container"), {
    model: monaco.editor.createModel(value, 'json', monaco.Uri.parse('inmemory://model.json')),
    glyphMargin: true,
    lightbulb: {
        enabled: true
    }
});
// install Monaco language client services
monaco_languageclient_1.MonacoServices.install(monaco);
// create the web socket
const url = createUrl('/sampleServer');
const webSocket = createWebSocket(url);
// listen when the web socket is opened
monaco_jsonrpc_1.listen({
    webSocket,
    onConnection: connection => {
        // create and start the language client
        const languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
    }
});
function createLanguageClient(connection) {
    return new monaco_languageclient_1.MonacoLanguageClient({
        name: "Sample Language Client",
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['json'],
            // disable the default error handler
            errorHandler: {
                error: () => monaco_languageclient_1.ErrorAction.Continue,
                closed: () => monaco_languageclient_1.CloseAction.DoNotRestart
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: (errorHandler, closeHandler) => {
                return Promise.resolve(monaco_languageclient_1.createConnection(connection, errorHandler, closeHandler));
            }
        }
    });
}
function createUrl(path) {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
}
function createWebSocket(url) {
    const socketOptions = {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: false
    };
    return new ReconnectingWebSocket(url, [], socketOptions);
}
//# sourceMappingURL=client.js.map