"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonacoLanguageClient = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const client_1 = require("vscode-languageclient/lib/common/client");
const typeDefinition_1 = require("vscode-languageclient/lib/common/typeDefinition");
const configuration_1 = require("vscode-languageclient/lib/common/configuration");
const implementation_1 = require("vscode-languageclient/lib/common/implementation");
const colorProvider_1 = require("vscode-languageclient/lib/common/colorProvider");
const workspaceFolders_1 = require("vscode-languageclient/lib/common/workspaceFolders");
const foldingRange_1 = require("vscode-languageclient/lib/common/foldingRange");
const callHierarchy_1 = require("vscode-languageclient/lib/common/callHierarchy");
const semanticTokens_1 = require("vscode-languageclient/lib/common/semanticTokens");
const declaration_1 = require("vscode-languageclient/lib/common/declaration");
__exportStar(require("vscode-languageclient/lib/common/client"), exports);
class MonacoLanguageClient extends client_1.BaseLanguageClient {
    constructor({ id, name, clientOptions, connectionProvider }) {
        super(id || name.toLowerCase(), name, clientOptions);
        this.connectionProvider = connectionProvider;
        this.createConnection = this.doCreateConnection.bind(this);
        // bypass LSP <=> VS Code conversion
        const self = this;
        self._p2c = new Proxy(self._p2c, {
            get: (target, prop) => {
                if (prop === 'asUri') {
                    return target[prop];
                }
                return MonacoLanguageClient.bypassConversion;
            }
        });
        self._c2p = new Proxy(self._c2p, {
            get: (target, prop) => {
                if (prop === 'asUri') {
                    return target[prop];
                }
                if (prop === 'asCompletionParams') {
                    return (textDocument, position, context) => {
                        return {
                            textDocument: target.asTextDocumentIdentifier(textDocument),
                            position,
                            context
                        };
                    };
                }
                if (prop === 'asWillSaveTextDocumentParams') {
                    return (event) => {
                        return {
                            textDocument: target.asTextDocumentIdentifier(event.document),
                            reason: event.reason
                        };
                    };
                }
                if (prop.endsWith('Params')) {
                    return target[prop];
                }
                return MonacoLanguageClient.bypassConversion;
            }
        });
    }
    doCreateConnection() {
        const errorHandler = this.handleConnectionError.bind(this);
        const closeHandler = this.handleConnectionClosed.bind(this);
        return this.connectionProvider.get(errorHandler, closeHandler, this.outputChannel);
    }
    createMessageTransports(encoding) {
        throw new Error('Unsupported');
    }
    registerBuiltinFeatures() {
        super.registerBuiltinFeatures();
        this.registerFeature(new configuration_1.ConfigurationFeature(this));
        this.registerFeature(new typeDefinition_1.TypeDefinitionFeature(this));
        this.registerFeature(new implementation_1.ImplementationFeature(this));
        this.registerFeature(new colorProvider_1.ColorProviderFeature(this));
        this.registerFeature(new workspaceFolders_1.WorkspaceFoldersFeature(this));
        foldingRange_1.FoldingRangeFeature['asFoldingRanges'] = MonacoLanguageClient.bypassConversion;
        this.registerFeature(new foldingRange_1.FoldingRangeFeature(this));
        this.registerFeature(new declaration_1.DeclarationFeature(this));
        this.registerFeature(new semanticTokens_1.SemanticTokensFeature(this));
        this.registerFeature(new callHierarchy_1.CallHierarchyFeature(this));
        const features = this['_features'];
        for (const feature of features) {
            if (feature instanceof colorProvider_1.ColorProviderFeature) {
                feature['asColor'] = MonacoLanguageClient.bypassConversion;
                feature['asColorInformations'] = MonacoLanguageClient.bypassConversion;
                feature['asColorPresentations'] = MonacoLanguageClient.bypassConversion;
            }
        }
    }
    registerProposedFeatures() {
    }
    getLocale() {
        return navigator.language || 'en-US';
    }
}
exports.MonacoLanguageClient = MonacoLanguageClient;
MonacoLanguageClient.bypassConversion = (result) => result || undefined;
//# sourceMappingURL=monaco-language-client.js.map