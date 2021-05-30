import type * as monaco from 'monaco-editor-core';
import { Languages, DiagnosticCollection, CompletionItemProvider, DocumentIdentifier, HoverProvider, SignatureHelpProvider, DefinitionProvider, ReferenceProvider, DocumentHighlightProvider, DocumentSymbolProvider, CodeActionProvider, CodeLensProvider, DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider, OnTypeFormattingEditProvider, RenameProvider, DocumentFilter, DocumentSelector, DocumentLinkProvider, ImplementationProvider, TypeDefinitionProvider, DocumentColorProvider, FoldingRangeProvider, SemanticTokensLegend, DocumentSemanticTokensProvider, DocumentRangeSemanticTokensProvider } from "./services";
import { ProtocolToMonacoConverter, MonacoToProtocolConverter } from './monaco-converter';
import { Disposable } from './disposable';
export interface MonacoModelIdentifier {
    uri: monaco.Uri;
    languageId: string;
}
export declare namespace MonacoModelIdentifier {
    function fromDocument(_monaco: typeof monaco, document: DocumentIdentifier): MonacoModelIdentifier;
    function fromModel(model: monaco.editor.IReadOnlyModel): MonacoModelIdentifier;
}
export declare function testGlob(pattern: string, value: string): boolean;
export declare class MonacoLanguages implements Languages {
    protected readonly _monaco: typeof monaco;
    protected readonly p2m: ProtocolToMonacoConverter;
    protected readonly m2p: MonacoToProtocolConverter;
    constructor(_monaco: typeof monaco, p2m: ProtocolToMonacoConverter, m2p: MonacoToProtocolConverter);
    match(selector: DocumentSelector, document: DocumentIdentifier): boolean;
    createDiagnosticCollection(name?: string): DiagnosticCollection;
    registerCompletionItemProvider(selector: DocumentSelector, provider: CompletionItemProvider, ...triggerCharacters: string[]): Disposable;
    protected createCompletionProvider(selector: DocumentSelector, provider: CompletionItemProvider, ...triggerCharacters: string[]): monaco.languages.CompletionItemProvider;
    registerHoverProvider(selector: DocumentSelector, provider: HoverProvider): Disposable;
    protected createHoverProvider(selector: DocumentSelector, provider: HoverProvider): monaco.languages.HoverProvider;
    registerSignatureHelpProvider(selector: DocumentSelector, provider: SignatureHelpProvider, ...triggerCharacters: string[]): Disposable;
    protected createSignatureHelpProvider(selector: DocumentSelector, provider: SignatureHelpProvider, ...triggerCharacters: string[]): monaco.languages.SignatureHelpProvider;
    registerDefinitionProvider(selector: DocumentSelector, provider: DefinitionProvider): Disposable;
    protected createDefinitionProvider(selector: DocumentSelector, provider: DefinitionProvider): monaco.languages.DefinitionProvider;
    registerReferenceProvider(selector: DocumentSelector, provider: ReferenceProvider): Disposable;
    protected createReferenceProvider(selector: DocumentSelector, provider: ReferenceProvider): monaco.languages.ReferenceProvider;
    registerDocumentHighlightProvider(selector: DocumentSelector, provider: DocumentHighlightProvider): Disposable;
    protected createDocumentHighlightProvider(selector: DocumentSelector, provider: DocumentHighlightProvider): monaco.languages.DocumentHighlightProvider;
    registerDocumentSymbolProvider(selector: DocumentSelector, provider: DocumentSymbolProvider): Disposable;
    protected createDocumentSymbolProvider(selector: DocumentSelector, provider: DocumentSymbolProvider): monaco.languages.DocumentSymbolProvider;
    registerCodeActionsProvider(selector: DocumentSelector, provider: CodeActionProvider): Disposable;
    protected createCodeActionProvider(selector: DocumentSelector, provider: CodeActionProvider): monaco.languages.CodeActionProvider;
    registerCodeLensProvider(selector: DocumentSelector, provider: CodeLensProvider): Disposable;
    protected createCodeLensProvider(selector: DocumentSelector, provider: CodeLensProvider): monaco.languages.CodeLensProvider;
    registerDocumentFormattingEditProvider(selector: DocumentSelector, provider: DocumentFormattingEditProvider): Disposable;
    protected createDocumentFormattingEditProvider(selector: DocumentSelector, provider: DocumentFormattingEditProvider): monaco.languages.DocumentFormattingEditProvider;
    registerDocumentRangeFormattingEditProvider(selector: DocumentSelector, provider: DocumentRangeFormattingEditProvider): Disposable;
    createDocumentRangeFormattingEditProvider(selector: DocumentSelector, provider: DocumentRangeFormattingEditProvider): monaco.languages.DocumentRangeFormattingEditProvider;
    registerOnTypeFormattingEditProvider(selector: DocumentSelector, provider: OnTypeFormattingEditProvider, firstTriggerCharacter: string, ...moreTriggerCharacter: string[]): Disposable;
    protected createOnTypeFormattingEditProvider(selector: DocumentSelector, provider: OnTypeFormattingEditProvider, firstTriggerCharacter: string, ...moreTriggerCharacter: string[]): monaco.languages.OnTypeFormattingEditProvider;
    registerRenameProvider(selector: DocumentSelector, provider: RenameProvider): Disposable;
    protected createRenameProvider(selector: DocumentSelector, provider: RenameProvider): monaco.languages.RenameProvider;
    registerDocumentLinkProvider(selector: DocumentSelector, provider: DocumentLinkProvider): Disposable;
    protected createDocumentLinkProvider(selector: DocumentSelector, provider: DocumentLinkProvider): monaco.languages.LinkProvider;
    registerImplementationProvider(selector: DocumentSelector, provider: ImplementationProvider): Disposable;
    protected createImplementationProvider(selector: DocumentSelector, provider: ImplementationProvider): monaco.languages.ImplementationProvider;
    registerTypeDefinitionProvider(selector: DocumentSelector, provider: TypeDefinitionProvider): Disposable;
    protected createTypeDefinitionProvider(selector: DocumentSelector, provider: TypeDefinitionProvider): monaco.languages.TypeDefinitionProvider;
    registerColorProvider(selector: DocumentSelector, provider: DocumentColorProvider): Disposable;
    protected createDocumentColorProvider(selector: DocumentSelector, provider: DocumentColorProvider): monaco.languages.DocumentColorProvider;
    registerFoldingRangeProvider(selector: DocumentSelector, provider: FoldingRangeProvider): Disposable;
    protected createFoldingRangeProvider(selector: DocumentSelector, provider: FoldingRangeProvider): monaco.languages.FoldingRangeProvider;
    registerDocumentSemanticTokensProvider(selector: DocumentSelector, provider: DocumentSemanticTokensProvider, legend: SemanticTokensLegend): Disposable;
    protected createSemanticTokensProvider(selector: DocumentSelector, provider: DocumentSemanticTokensProvider, legend: SemanticTokensLegend): monaco.languages.DocumentSemanticTokensProvider;
    registerDocumentRangeSemanticTokensProvider(selector: DocumentSelector, provider: DocumentRangeSemanticTokensProvider, legend: SemanticTokensLegend): Disposable;
    protected createRangeSemanticTokensProvider(selector: DocumentSelector, provider: DocumentRangeSemanticTokensProvider, legend: SemanticTokensLegend): monaco.languages.DocumentRangeSemanticTokensProvider;
    protected matchModel(selector: string | DocumentFilter | DocumentSelector, model: MonacoModelIdentifier): boolean;
    protected matchLanguage(selector: string | DocumentFilter | DocumentSelector): Set<string>;
    protected matchLanguageByFilter(selector: string | DocumentFilter): string;
}
//# sourceMappingURL=monaco-languages.d.ts.map