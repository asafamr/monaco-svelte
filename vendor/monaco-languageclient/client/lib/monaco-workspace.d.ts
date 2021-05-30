import type * as monaco from 'monaco-editor-core';
import { MonacoToProtocolConverter, ProtocolToMonacoConverter } from './monaco-converter';
import { Workspace, WorkspaceEdit, TextDocumentDidChangeEvent, Event, Emitter } from './services';
import { TextDocument } from 'vscode-languageserver-textdocument';
export declare class MonacoWorkspace implements Workspace {
    protected readonly _monaco: typeof monaco;
    protected readonly p2m: ProtocolToMonacoConverter;
    protected readonly m2p: MonacoToProtocolConverter;
    protected _rootUri: string | null;
    protected readonly documents: Map<string, TextDocument>;
    protected readonly onDidOpenTextDocumentEmitter: Emitter<TextDocument>;
    protected readonly onDidCloseTextDocumentEmitter: Emitter<TextDocument>;
    protected readonly onDidChangeTextDocumentEmitter: Emitter<TextDocumentDidChangeEvent>;
    constructor(_monaco: typeof monaco, p2m: ProtocolToMonacoConverter, m2p: MonacoToProtocolConverter, _rootUri?: string | null);
    get rootUri(): string | null;
    protected removeModel(model: monaco.editor.IModel): void;
    protected addModel(model: monaco.editor.IModel): void;
    protected onDidChangeContent(uri: string, model: monaco.editor.IModel, event: monaco.editor.IModelContentChangedEvent): void;
    protected setModel(uri: string, model: monaco.editor.IModel): TextDocument;
    get textDocuments(): TextDocument[];
    get onDidOpenTextDocument(): Event<TextDocument>;
    get onDidCloseTextDocument(): Event<TextDocument>;
    get onDidChangeTextDocument(): Event<TextDocumentDidChangeEvent>;
    applyEdit(workspaceEdit: WorkspaceEdit): Promise<boolean>;
}
//# sourceMappingURL=monaco-workspace.d.ts.map