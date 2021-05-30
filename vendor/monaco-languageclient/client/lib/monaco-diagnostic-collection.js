"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonacoModelDiagnostics = exports.MonacoDiagnosticCollection = void 0;
const disposable_1 = require("./disposable");
class MonacoDiagnosticCollection {
    constructor(_monaco, name, p2m) {
        this._monaco = _monaco;
        this.name = name;
        this.p2m = p2m;
        this.diagnostics = new Map();
        this.toDispose = new disposable_1.DisposableCollection();
    }
    dispose() {
        this.toDispose.dispose();
    }
    get(uri) {
        const diagnostics = this.diagnostics.get(uri);
        return !!diagnostics ? diagnostics.diagnostics : [];
    }
    set(uri, diagnostics) {
        const existing = this.diagnostics.get(uri);
        if (existing) {
            existing.diagnostics = diagnostics;
        }
        else {
            const modelDiagnostics = new MonacoModelDiagnostics(this._monaco, uri, diagnostics, this.name, this.p2m);
            this.diagnostics.set(uri, modelDiagnostics);
            this.toDispose.push(disposable_1.Disposable.create(() => {
                this.diagnostics.delete(uri);
                modelDiagnostics.dispose();
            }));
        }
    }
}
exports.MonacoDiagnosticCollection = MonacoDiagnosticCollection;
class MonacoModelDiagnostics {
    constructor(_monaco, uri, diagnostics, owner, p2m) {
        this._monaco = _monaco;
        this.owner = owner;
        this.p2m = p2m;
        this._markers = [];
        this._diagnostics = [];
        this.toDispose = new disposable_1.DisposableCollection();
        this.uri = this._monaco.Uri.parse(uri);
        this.diagnostics = diagnostics;
        this.toDispose.push(this._monaco.editor.onDidCreateModel(model => this.doUpdateModelMarkers(model)));
    }
    set diagnostics(diagnostics) {
        this._diagnostics = diagnostics;
        this._markers = this.p2m.asDiagnostics(diagnostics);
        this.updateModelMarkers();
    }
    get diagnostics() {
        return this._diagnostics;
    }
    get markers() {
        return this._markers;
    }
    dispose() {
        this._markers = [];
        this.updateModelMarkers();
        this.toDispose.dispose();
    }
    updateModelMarkers() {
        const model = this._monaco.editor.getModel(this.uri);
        this.doUpdateModelMarkers(model ? model : undefined);
    }
    doUpdateModelMarkers(model) {
        if (model && this.uri.toString() === model.uri.toString()) {
            this._monaco.editor.setModelMarkers(model, this.owner, this._markers);
        }
    }
}
exports.MonacoModelDiagnostics = MonacoModelDiagnostics;
//# sourceMappingURL=monaco-diagnostic-collection.js.map