"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonacoWorkspace = void 0;
const services_1 = require("./services");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
class MonacoWorkspace {
    constructor(_monaco, p2m, m2p, _rootUri = null) {
        this._monaco = _monaco;
        this.p2m = p2m;
        this.m2p = m2p;
        this._rootUri = _rootUri;
        this.documents = new Map();
        this.onDidOpenTextDocumentEmitter = new services_1.Emitter();
        this.onDidCloseTextDocumentEmitter = new services_1.Emitter();
        this.onDidChangeTextDocumentEmitter = new services_1.Emitter();
        for (const model of this._monaco.editor.getModels()) {
            this.addModel(model);
        }
        this._monaco.editor.onDidCreateModel(model => this.addModel(model));
        this._monaco.editor.onWillDisposeModel(model => this.removeModel(model));
    }
    get rootUri() {
        return this._rootUri;
    }
    removeModel(model) {
        const uri = model.uri.toString();
        const document = this.documents.get(uri);
        if (document) {
            this.documents.delete(uri);
            this.onDidCloseTextDocumentEmitter.fire(document);
        }
    }
    addModel(model) {
        const uri = model.uri.toString();
        const document = this.setModel(uri, model);
        this.onDidOpenTextDocumentEmitter.fire(document);
        model.onDidChangeContent(event => this.onDidChangeContent(uri, model, event));
    }
    onDidChangeContent(uri, model, event) {
        const textDocument = this.setModel(uri, model);
        const contentChanges = [];
        for (const change of event.changes) {
            const range = this.m2p.asRange(change.range);
            const rangeLength = change.rangeLength;
            const text = change.text;
            contentChanges.push({ range, rangeLength, text });
        }
        this.onDidChangeTextDocumentEmitter.fire({
            textDocument,
            contentChanges
        });
    }
    setModel(uri, model) {
        const document = vscode_languageserver_textdocument_1.TextDocument.create(uri, model.getModeId(), model.getVersionId(), model.getValue());
        this.documents.set(uri, document);
        return document;
    }
    get textDocuments() {
        return Array.from(this.documents.values());
    }
    get onDidOpenTextDocument() {
        return this.onDidOpenTextDocumentEmitter.event;
    }
    get onDidCloseTextDocument() {
        return this.onDidCloseTextDocumentEmitter.event;
    }
    get onDidChangeTextDocument() {
        return this.onDidChangeTextDocumentEmitter.event;
    }
    applyEdit(workspaceEdit) {
        const edit = this.p2m.asWorkspaceEdit(workspaceEdit);
        // Collect all referenced models
        const models = edit.edits ? edit.edits.reduce((acc, currentEdit) => {
            const textEdit = currentEdit;
            acc[textEdit.resource.toString()] = this._monaco.editor.getModel(textEdit.resource);
            return acc;
        }, {}) : {};
        // If any of the models do not exist, refuse to apply the edit.
        if (!Object.keys(models).map(uri => models[uri]).every(model => !!model)) {
            return Promise.resolve(false);
        }
        // Group edits by resource so we can batch them when applying
        const editsByResource = edit.edits ? edit.edits.reduce((acc, currentEdit) => {
            const textEdit = currentEdit;
            const uri = textEdit.resource.toString();
            if (!(uri in acc)) {
                acc[uri] = [];
            }
            acc[uri].push({
                range: this._monaco.Range.lift(textEdit.edit.range),
                text: textEdit.edit.text,
            });
            return acc;
        }, {}) : {};
        // Apply edits for each resource
        Object.keys(editsByResource).forEach(uri => {
            models[uri].pushEditOperations([], // Do not try and preserve editor selections.
            editsByResource[uri].map(resourceEdit => {
                return {
                    identifier: { major: 1, minor: 0 },
                    range: resourceEdit.range,
                    text: resourceEdit.text,
                    forceMoveMarkers: true,
                };
            }), () => []);
        });
        return Promise.resolve(true);
    }
}
exports.MonacoWorkspace = MonacoWorkspace;
//# sourceMappingURL=monaco-workspace.js.map