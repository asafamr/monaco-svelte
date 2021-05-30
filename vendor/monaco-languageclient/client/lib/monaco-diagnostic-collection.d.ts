import type * as monaco from 'monaco-editor-core';
import { DiagnosticCollection, Diagnostic } from './services';
import { DisposableCollection, Disposable } from './disposable';
import { ProtocolToMonacoConverter } from './monaco-converter';
export declare class MonacoDiagnosticCollection implements DiagnosticCollection {
    protected readonly _monaco: typeof monaco;
    protected readonly name: string;
    protected readonly p2m: ProtocolToMonacoConverter;
    protected readonly diagnostics: Map<string, MonacoModelDiagnostics | undefined>;
    protected readonly toDispose: DisposableCollection;
    constructor(_monaco: typeof monaco, name: string, p2m: ProtocolToMonacoConverter);
    dispose(): void;
    get(uri: string): Diagnostic[];
    set(uri: string, diagnostics: Diagnostic[]): void;
}
export declare class MonacoModelDiagnostics implements Disposable {
    protected readonly _monaco: typeof monaco;
    readonly owner: string;
    protected readonly p2m: ProtocolToMonacoConverter;
    readonly uri: monaco.Uri;
    protected _markers: monaco.editor.IMarkerData[];
    protected _diagnostics: Diagnostic[];
    protected readonly toDispose: DisposableCollection;
    constructor(_monaco: typeof monaco, uri: string, diagnostics: Diagnostic[], owner: string, p2m: ProtocolToMonacoConverter);
    set diagnostics(diagnostics: Diagnostic[]);
    get diagnostics(): Diagnostic[];
    get markers(): ReadonlyArray<monaco.editor.IMarkerData>;
    dispose(): void;
    updateModelMarkers(): void;
    protected doUpdateModelMarkers(model: monaco.editor.IModel | undefined): void;
}
//# sourceMappingURL=monaco-diagnostic-collection.d.ts.map