/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
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
exports.ConfigurationTarget = exports.DocumentIdentifier = exports.VsCodeDiagnosticSeverity = exports.SignatureHelpTriggerKind = exports.isDocumentSelector = exports.Services = exports.TextDocument = exports.Emitter = exports.Event = exports.CancellationToken = exports.Disposable = void 0;
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
Object.defineProperty(exports, "TextDocument", { enumerable: true, get: function () { return vscode_languageserver_textdocument_1.TextDocument; } });
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
Object.defineProperty(exports, "Disposable", { enumerable: true, get: function () { return vscode_jsonrpc_1.Disposable; } });
Object.defineProperty(exports, "CancellationToken", { enumerable: true, get: function () { return vscode_jsonrpc_1.CancellationToken; } });
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return vscode_jsonrpc_1.Event; } });
Object.defineProperty(exports, "Emitter", { enumerable: true, get: function () { return vscode_jsonrpc_1.Emitter; } });
__exportStar(require("vscode-languageserver-protocol/lib/common/api"), exports);
var Services;
(function (Services) {
    const global = window;
    const symbol = Symbol('Services');
    Services.get = () => {
        const services = global[symbol];
        if (!services) {
            throw new Error('Language Client services has not been installed');
        }
        return services;
    };
    function install(services) {
        if (global[symbol]) {
            console.warn('Language Client services have been overridden');
        }
        global[symbol] = services;
        return vscode_jsonrpc_1.Disposable.create(() => global[symbol] = undefined);
    }
    Services.install = install;
})(Services = exports.Services || (exports.Services = {}));
function isDocumentSelector(selector) {
    if (!selector || !Array.isArray(selector)) {
        return false;
    }
    return selector.every(value => typeof value === 'string' || vscode_languageserver_protocol_1.DocumentFilter.is(value));
}
exports.isDocumentSelector = isDocumentSelector;
var SignatureHelpTriggerKind;
(function (SignatureHelpTriggerKind) {
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind = exports.SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = {}));
// runtime support
var VsCodeDiagnosticSeverity;
(function (VsCodeDiagnosticSeverity) {
    VsCodeDiagnosticSeverity[VsCodeDiagnosticSeverity["Error"] = 0] = "Error";
    VsCodeDiagnosticSeverity[VsCodeDiagnosticSeverity["Warning"] = 1] = "Warning";
    VsCodeDiagnosticSeverity[VsCodeDiagnosticSeverity["Information"] = 2] = "Information";
    VsCodeDiagnosticSeverity[VsCodeDiagnosticSeverity["Hint"] = 3] = "Hint";
})(VsCodeDiagnosticSeverity = exports.VsCodeDiagnosticSeverity || (exports.VsCodeDiagnosticSeverity = {}));
var DocumentIdentifier;
(function (DocumentIdentifier) {
    function is(arg) {
        return !!arg && ('uri' in arg) && ('languageId' in arg);
    }
    DocumentIdentifier.is = is;
})(DocumentIdentifier = exports.DocumentIdentifier || (exports.DocumentIdentifier = {}));
var ConfigurationTarget;
(function (ConfigurationTarget) {
    ConfigurationTarget[ConfigurationTarget["Global"] = 1] = "Global";
    ConfigurationTarget[ConfigurationTarget["Workspace"] = 2] = "Workspace";
    ConfigurationTarget[ConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
})(ConfigurationTarget = exports.ConfigurationTarget || (exports.ConfigurationTarget = {}));
//# sourceMappingURL=services.js.map