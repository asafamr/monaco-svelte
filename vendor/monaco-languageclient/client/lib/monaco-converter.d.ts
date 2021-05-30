import type * as monaco from 'monaco-editor-core';
import * as ls from 'vscode-languageserver-protocol';
import { CodeActionParams, CodeLensParams, DocumentFormattingParams, DocumentOnTypeFormattingParams, DocumentRangeFormattingParams, ReferenceParams, RenameParams, TextDocumentPositionParams, Position, TextDocumentIdentifier, CompletionItem, CompletionList, CompletionParams, CompletionContext, CompletionTriggerKind, Range, Diagnostic, CompletionItemKind, Hover, SignatureHelp, SignatureInformation, ParameterInformation, Definition, DefinitionLink, Location, DocumentHighlight, SymbolInformation, DocumentSymbolParams, CodeActionContext, DiagnosticSeverity, Command, CodeLens, FormattingOptions, TextEdit, WorkspaceEdit, DocumentLinkParams, DocumentLink, MarkedString, MarkupContent, ColorInformation, ColorPresentation, FoldingRange, DiagnosticRelatedInformation, SymbolKind, DocumentSymbol, CodeAction, SignatureHelpContext, SignatureHelpTriggerKind, SemanticTokens, InsertTextMode, AnnotatedTextEdit, ChangeAnnotation } from './services';
export declare type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
export interface ProtocolDocumentLink extends monaco.languages.ILink {
    data?: any;
}
export declare namespace ProtocolDocumentLink {
    function is(item: any): item is ProtocolDocumentLink;
}
export interface ProtocolCodeLens extends monaco.languages.CodeLens {
    data?: any;
}
export declare namespace ProtocolCodeLens {
    function is(item: any): item is ProtocolCodeLens;
}
export interface ProtocolCompletionItem extends monaco.languages.CompletionItem {
    data?: any;
    fromEdit?: boolean;
    documentationFormat?: string;
    originalItemKind?: CompletionItemKind;
    deprecated?: boolean;
    insertTextMode?: InsertTextMode;
}
export declare namespace ProtocolCompletionItem {
    function is(item: any): item is ProtocolCompletionItem;
}
export interface ProtocolCodeAction extends monaco.languages.CodeAction {
    data?: any;
}
export declare namespace ProtocolCodeAction {
    function is(item: any): item is ProtocolCodeAction;
}
declare type RangeReplace = {
    insert: monaco.IRange;
    replace: monaco.IRange;
};
export declare class MonacoToProtocolConverter {
    protected readonly _monaco: typeof monaco;
    constructor(_monaco: typeof monaco);
    asPosition(lineNumber: undefined | null, column: undefined | null): {};
    asPosition(lineNumber: number, column: undefined | null): Pick<Position, 'line'>;
    asPosition(lineNumber: undefined | null, column: number): Pick<Position, 'character'>;
    asPosition(lineNumber: number, column: number): Position;
    asPosition(lineNumber: number | undefined | null, column: number | undefined | null): Partial<Position>;
    asRange(range: null): null;
    asRange(range: undefined): undefined;
    asRange(range: monaco.IRange): Range;
    asRange(range: monaco.IRange | undefined): Range | undefined;
    asRange(range: monaco.IRange | null): Range | null;
    asRange(range: monaco.IRange | {
        insert: monaco.IRange;
        replace: monaco.IRange;
    }): Range;
    asRange(range: Partial<monaco.IRange>): RecursivePartial<Range>;
    asRange(range: Partial<monaco.IRange> | undefined): RecursivePartial<Range> | undefined;
    asRange(range: Partial<monaco.IRange> | null): RecursivePartial<Range> | null;
    asTextDocumentIdentifier(model: monaco.editor.IReadOnlyModel): TextDocumentIdentifier;
    asTextDocumentPositionParams(model: monaco.editor.IReadOnlyModel, position: monaco.Position): TextDocumentPositionParams;
    asCompletionParams(model: monaco.editor.IReadOnlyModel, position: monaco.Position, context: monaco.languages.CompletionContext): CompletionParams;
    asCompletionContext(context: monaco.languages.CompletionContext): CompletionContext;
    asSignatureHelpContext(context: monaco.languages.SignatureHelpContext): SignatureHelpContext;
    asSignatureHelp(signatureHelp: monaco.languages.SignatureHelp | undefined): SignatureHelp | undefined;
    asSignatureInformation(signatureInformation: monaco.languages.SignatureInformation): SignatureInformation;
    asParameterInformation(parameterInformation: monaco.languages.ParameterInformation): ParameterInformation;
    asMarkupContent(markupContent: (string | monaco.IMarkdownString | undefined)): string | MarkupContent | undefined;
    asSignatureHelpTriggerKind(triggerKind: monaco.languages.SignatureHelpTriggerKind): SignatureHelpTriggerKind;
    asCompletionTriggerKind(triggerKind: monaco.languages.CompletionTriggerKind): CompletionTriggerKind;
    asCompletionItem(item: monaco.languages.CompletionItem): CompletionItem;
    protected asCompletionItemKind(value: monaco.languages.CompletionItemKind, original: CompletionItemKind | undefined): CompletionItemKind;
    protected asDocumentation(format: string, documentation: string | monaco.IMarkdownString): string | MarkupContent;
    protected fillPrimaryInsertText(target: CompletionItem, source: ProtocolCompletionItem): void;
    asTextEdit(edit: monaco.editor.ISingleEditOperation): TextEdit;
    asTextEdits(items: monaco.editor.ISingleEditOperation[]): TextEdit[];
    asTextEdits(items: undefined | null): undefined;
    asTextEdits(items: monaco.editor.ISingleEditOperation[] | undefined | null): TextEdit[] | undefined;
    asReferenceParams(model: monaco.editor.IReadOnlyModel, position: monaco.Position, options: {
        includeDeclaration: boolean;
    }): ReferenceParams;
    asDocumentSymbolParams(model: monaco.editor.IReadOnlyModel): DocumentSymbolParams;
    asCodeLensParams(model: monaco.editor.IReadOnlyModel): CodeLensParams;
    asDiagnosticSeverity(value: monaco.MarkerSeverity): DiagnosticSeverity | undefined;
    asDiagnostic(marker: monaco.editor.IMarkerData): Diagnostic;
    asDiagnostics(markers: monaco.editor.IMarkerData[]): Diagnostic[];
    asCodeActionContext(context: monaco.languages.CodeActionContext): CodeActionContext;
    asCodeActionParams(model: monaco.editor.IReadOnlyModel, range: monaco.Range, context: monaco.languages.CodeActionContext): CodeActionParams;
    asCommand(item: monaco.languages.Command | undefined | null): Command | undefined;
    asCodeLens(item: monaco.languages.CodeLens): CodeLens;
    asFormattingOptions(options: monaco.languages.FormattingOptions): FormattingOptions;
    asDocumentFormattingParams(model: monaco.editor.IReadOnlyModel, options: monaco.languages.FormattingOptions): DocumentFormattingParams;
    asDocumentRangeFormattingParams(model: monaco.editor.IReadOnlyModel, range: monaco.Range, options: monaco.languages.FormattingOptions): DocumentRangeFormattingParams;
    asDocumentOnTypeFormattingParams(model: monaco.editor.IReadOnlyModel, position: monaco.IPosition, ch: string, options: monaco.languages.FormattingOptions): DocumentOnTypeFormattingParams;
    asRenameParams(model: monaco.editor.IReadOnlyModel, position: monaco.IPosition, newName: string): RenameParams;
    asDocumentLinkParams(model: monaco.editor.IReadOnlyModel): DocumentLinkParams;
    asDocumentLink(item: monaco.languages.ILink): DocumentLink;
    asCodeAction(item: monaco.languages.CodeAction): CodeAction;
}
export declare class ProtocolToMonacoConverter {
    protected readonly _monaco: typeof monaco;
    constructor(_monaco: typeof monaco);
    asResourceEdits(resource: monaco.Uri, edits: (TextEdit | AnnotatedTextEdit)[], asMetadata: (annotation: ls.ChangeAnnotationIdentifier | undefined) => monaco.languages.WorkspaceEditMetadata | undefined, modelVersionId?: number): monaco.languages.WorkspaceTextEdit[];
    asWorkspaceEditMetadata(changeAnnotation: ChangeAnnotation): monaco.languages.WorkspaceEditMetadata;
    asWorkspaceEdit(item: WorkspaceEdit): monaco.languages.WorkspaceEdit;
    asWorkspaceEdit(item: undefined | null): undefined;
    asWorkspaceEdit(item: WorkspaceEdit | undefined | null): monaco.languages.WorkspaceEdit | undefined;
    asTextEdit(edit: TextEdit): monaco.languages.TextEdit;
    asTextEdit(edit: undefined | null): undefined;
    asTextEdit(edit: TextEdit | undefined | null): undefined;
    asTextEdits(items: TextEdit[]): monaco.languages.TextEdit[];
    asTextEdits(items: undefined | null): undefined;
    asTextEdits(items: TextEdit[] | undefined | null): monaco.languages.TextEdit[] | undefined;
    asCodeLens(item: CodeLens): monaco.languages.CodeLens;
    asCodeLens(item: undefined | null): undefined;
    asCodeLens(item: CodeLens | undefined | null): monaco.languages.CodeLens | undefined;
    asCodeLensList(items: CodeLens[]): monaco.languages.CodeLensList;
    asCodeLensList(items: undefined | null): undefined;
    asCodeLensList(items: CodeLens[] | undefined | null): monaco.languages.CodeLensList | undefined;
    asCodeActionList(actions: (Command | CodeAction)[]): monaco.languages.CodeActionList;
    asCodeAction(item: Command | CodeAction): ProtocolCodeAction;
    asCommand(command: Command): monaco.languages.Command;
    asCommand(command: undefined): undefined;
    asCommand(command: Command | undefined): monaco.languages.Command | undefined;
    asDocumentSymbol(value: DocumentSymbol): monaco.languages.DocumentSymbol;
    asDocumentSymbols(values: SymbolInformation[] | DocumentSymbol[]): monaco.languages.DocumentSymbol[];
    asSymbolInformations(values: SymbolInformation[], uri?: monaco.Uri): monaco.languages.DocumentSymbol[];
    asSymbolInformations(values: undefined | null, uri?: monaco.Uri): undefined;
    asSymbolInformations(values: SymbolInformation[] | undefined | null, uri?: monaco.Uri): monaco.languages.DocumentSymbol[] | undefined;
    asSymbolInformation(item: SymbolInformation, uri?: monaco.Uri): monaco.languages.DocumentSymbol;
    asSymbolKind(item: SymbolKind): monaco.languages.SymbolKind;
    asDocumentHighlights(values: DocumentHighlight[]): monaco.languages.DocumentHighlight[];
    asDocumentHighlights(values: undefined | null): undefined;
    asDocumentHighlights(values: DocumentHighlight[] | undefined | null): monaco.languages.DocumentHighlight[] | undefined;
    asDocumentHighlight(item: DocumentHighlight): monaco.languages.DocumentHighlight;
    asDocumentHighlightKind(item: number): monaco.languages.DocumentHighlightKind;
    asReferences(values: Location[]): monaco.languages.Location[];
    asReferences(values: undefined | null): monaco.languages.Location[] | undefined;
    asReferences(values: Location[] | undefined | null): monaco.languages.Location[] | undefined;
    asDefinitionResult(item: Definition): monaco.languages.Definition;
    asDefinitionResult(item: DefinitionLink[]): monaco.languages.Definition;
    asDefinitionResult(item: undefined | null): undefined;
    asDefinitionResult(item: Definition | DefinitionLink[] | undefined | null): monaco.languages.Definition | undefined;
    asLocation(item: Location): monaco.languages.Location;
    asLocation(item: undefined | null): undefined;
    asLocation(item: Location | undefined | null): monaco.languages.Location | undefined;
    asLocationLink(item: undefined | null): undefined;
    asLocationLink(item: ls.LocationLink): monaco.languages.LocationLink;
    asSignatureHelpResult(item: undefined | null): undefined;
    asSignatureHelpResult(item: SignatureHelp): monaco.languages.SignatureHelpResult;
    asSignatureHelpResult(item: SignatureHelp | undefined | null): monaco.languages.SignatureHelpResult | undefined;
    asSignatureInformations(items: SignatureInformation[]): monaco.languages.SignatureInformation[];
    asSignatureInformation(item: SignatureInformation): monaco.languages.SignatureInformation;
    asParameterInformations(item: ParameterInformation[]): monaco.languages.ParameterInformation[];
    asParameterInformation(item: ParameterInformation): monaco.languages.ParameterInformation;
    asHover(hover: Hover): monaco.languages.Hover;
    asHover(hover: undefined | null): undefined;
    asHover(hover: Hover | undefined | null): monaco.languages.Hover | undefined;
    asHoverContent(contents: MarkedString | MarkedString[] | MarkupContent): monaco.IMarkdownString[];
    asDocumentation(value: string | MarkupContent): string | monaco.IMarkdownString;
    asMarkdownString(content: MarkedString | MarkupContent): monaco.IMarkdownString;
    asSeverity(severity?: number): monaco.MarkerSeverity;
    asDiagnostics(diagnostics: undefined): undefined;
    asDiagnostics(diagnostics: Diagnostic[]): monaco.editor.IMarkerData[];
    asDiagnostics(diagnostics: Diagnostic[] | undefined): monaco.editor.IMarkerData[] | undefined;
    asDiagnostic(diagnostic: Diagnostic): monaco.editor.IMarkerData;
    asRelatedInformations(relatedInformation?: DiagnosticRelatedInformation[]): monaco.editor.IRelatedInformation[] | undefined;
    asRelatedInformation(relatedInformation: DiagnosticRelatedInformation): monaco.editor.IRelatedInformation;
    asCompletionResult(result: CompletionItem[] | CompletionList | null | undefined, defaultRange: monaco.IRange): monaco.languages.CompletionList;
    asCompletionItem(item: CompletionItem, defaultRange: monaco.IRange | RangeReplace): ProtocolCompletionItem;
    asCompletionItemKind(value: CompletionItemKind): [monaco.languages.CompletionItemKind, CompletionItemKind | undefined];
    asCompletionInsertText(item: CompletionItem, defaultRange: monaco.IRange | RangeReplace): {
        insertText: string;
        range: monaco.IRange | RangeReplace;
        fromEdit: boolean;
        isSnippet: boolean;
    };
    asDocumentLinks(documentLinks: DocumentLink[]): monaco.languages.ILinksList;
    asDocumentLink(documentLink: DocumentLink): ProtocolDocumentLink;
    asRange(range: null): null;
    asRange(range: undefined): undefined;
    asRange(range: Range): monaco.Range;
    asRange(range: Range | undefined): monaco.Range | undefined;
    asRange(range: Range | null): monaco.Range | null;
    asRange(range: RecursivePartial<Range>): Partial<monaco.IRange>;
    asRange(range: RecursivePartial<Range> | undefined): monaco.Range | Partial<monaco.IRange> | undefined;
    asRange(range: RecursivePartial<Range> | null): monaco.Range | Partial<monaco.IRange> | null;
    asPosition(position: null): null;
    asPosition(position: undefined): undefined;
    asPosition(position: Position): monaco.Position;
    asPosition(position: Position | undefined): monaco.Position | undefined;
    asPosition(position: Position | null): monaco.Position | null;
    asPosition(position: Partial<Position>): Partial<monaco.IPosition>;
    asPosition(position: Partial<Position> | undefined): monaco.Position | Partial<monaco.IPosition> | undefined;
    asPosition(position: Partial<Position> | null): monaco.Position | Partial<monaco.IPosition> | null;
    asColorInformations(items: ColorInformation[]): monaco.languages.IColorInformation[];
    asColorInformation(item: ColorInformation): monaco.languages.IColorInformation;
    asColorPresentations(items: ColorPresentation[]): monaco.languages.IColorPresentation[];
    asColorPresentation(item: ColorPresentation): monaco.languages.IColorPresentation;
    asFoldingRanges(items: undefined | null): undefined | null;
    asFoldingRanges(items: FoldingRange[]): monaco.languages.FoldingRange[];
    asFoldingRange(item: FoldingRange): monaco.languages.FoldingRange;
    asFoldingRangeKind(kind?: string): monaco.languages.FoldingRangeKind | undefined;
    asSemanticTokens(semanticTokens: SemanticTokens): monaco.languages.SemanticTokens;
}
export {};
//# sourceMappingURL=monaco-converter.d.ts.map