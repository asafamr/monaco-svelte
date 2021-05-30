import { URI } from 'vscode-uri';
import { MessageReader, MessageWriter } from "vscode-jsonrpc";
import { _Connection, TextDocuments, DocumentSymbolParams } from 'vscode-languageserver/lib/node/main';
import { Diagnostic, Command, CompletionList, CompletionItem, Hover, SymbolInformation, TextEdit, FoldingRange, ColorInformation, ColorPresentation } from "vscode-languageserver-types";
import { TextDocumentPositionParams, DocumentRangeFormattingParams, ExecuteCommandParams, CodeActionParams, FoldingRangeParams, DocumentColorParams, ColorPresentationParams } from 'vscode-languageserver-protocol';
import { LanguageService, JSONDocument } from "vscode-json-languageservice";
import * as TextDocumentImpl from "vscode-languageserver-textdocument";
export declare function start(reader: MessageReader, writer: MessageWriter): JsonServer;
export declare class JsonServer {
    protected readonly connection: _Connection;
    protected workspaceRoot: URI | undefined;
    protected readonly documents: TextDocuments<TextDocumentImpl.TextDocument>;
    protected readonly jsonService: LanguageService;
    protected readonly pendingValidationRequests: Map<string, number>;
    constructor(connection: _Connection);
    start(): void;
    protected getFoldingRanges(params: FoldingRangeParams): FoldingRange[];
    protected findDocumentColors(params: DocumentColorParams): Thenable<ColorInformation[]>;
    protected getColorPresentations(params: ColorPresentationParams): ColorPresentation[];
    protected codeAction(params: CodeActionParams): Command[];
    protected format(params: DocumentRangeFormattingParams): TextEdit[];
    protected findDocumentSymbols(params: DocumentSymbolParams): SymbolInformation[];
    protected executeCommand(params: ExecuteCommandParams): any;
    protected hover(params: TextDocumentPositionParams): Thenable<Hover | null>;
    protected resolveSchema(url: string): Promise<string>;
    protected resolveCompletion(item: CompletionItem): Thenable<CompletionItem>;
    protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null>;
    protected validate(document: TextDocumentImpl.TextDocument): void;
    protected cleanPendingValidation(document: TextDocumentImpl.TextDocument): void;
    protected doValidate(document: TextDocumentImpl.TextDocument): void;
    protected cleanDiagnostics(document: TextDocumentImpl.TextDocument): void;
    protected sendDiagnostics(document: TextDocumentImpl.TextDocument, diagnostics: Diagnostic[]): void;
    protected getJSONDocument(document: TextDocumentImpl.TextDocument): JSONDocument;
}
//# sourceMappingURL=json-server.d.ts.map