import { Message, RequestType, RequestType0, RequestHandler, RequestHandler0, GenericRequestHandler, NotificationType, NotificationType0, NotificationHandler, NotificationHandler0, GenericNotificationHandler, Trace, Tracer, CancellationToken, MessageConnection, MessageSignature } from 'vscode-jsonrpc';
import { InitializeParams, InitializeResult, LogMessageParams, ShowMessageParams, DidChangeConfigurationParams, DidOpenTextDocumentParams, DidChangeTextDocumentParams, DidCloseTextDocumentParams, DidSaveTextDocumentParams, DidChangeWatchedFilesParams, PublishDiagnosticsParams } from 'vscode-languageserver-protocol';
import { OutputChannel } from "./services";
export interface IConnection {
    listen(): void;
    sendRequest<R, E>(type: RequestType0<R, E>, token?: CancellationToken): Thenable<R>;
    sendRequest<P, R, E>(type: RequestType<P, R, E>, params: P, token?: CancellationToken): Thenable<R>;
    sendRequest<R>(method: string, token?: CancellationToken): Thenable<R>;
    sendRequest<R>(method: string, param: any, token?: CancellationToken): Thenable<R>;
    sendRequest<R>(type: string | MessageSignature, ...params: any[]): Thenable<R>;
    onRequest<R, E>(type: RequestType0<R, E>, handler: RequestHandler0<R, E>): void;
    onRequest<P, R, E>(type: RequestType<P, R, E>, handler: RequestHandler<P, R, E>): void;
    onRequest<R, E>(method: string, handler: GenericRequestHandler<R, E>): void;
    onRequest<R, E>(method: string | MessageSignature, handler: GenericRequestHandler<R, E>): void;
    sendNotification<RO>(type: NotificationType0): void;
    sendNotification<P>(type: NotificationType<P>, params?: P): void;
    sendNotification(method: string): void;
    sendNotification(method: string, params: any): void;
    sendNotification(method: string | MessageSignature, params?: any): void;
    onNotification<RO>(type: NotificationType0, handler: NotificationHandler0): void;
    onNotification<P>(type: NotificationType<P>, handler: NotificationHandler<P>): void;
    onNotification(method: string, handler: GenericNotificationHandler): void;
    onNotification(method: string | MessageSignature, handler: GenericNotificationHandler): void;
    trace(value: Trace, tracer: Tracer, sendNotification?: boolean): void;
    initialize(params: InitializeParams): Thenable<InitializeResult>;
    shutdown(): Thenable<void>;
    exit(): void;
    onLogMessage(handle: NotificationHandler<LogMessageParams>): void;
    onShowMessage(handler: NotificationHandler<ShowMessageParams>): void;
    onTelemetry(handler: NotificationHandler<any>): void;
    didChangeConfiguration(params: DidChangeConfigurationParams): void;
    didChangeWatchedFiles(params: DidChangeWatchedFilesParams): void;
    didOpenTextDocument(params: DidOpenTextDocumentParams): void;
    didChangeTextDocument(params: DidChangeTextDocumentParams): void;
    didCloseTextDocument(params: DidCloseTextDocumentParams): void;
    didSaveTextDocument(params: DidSaveTextDocumentParams): void;
    onDiagnostics(handler: NotificationHandler<PublishDiagnosticsParams>): void;
    dispose(): void;
    end(): void;
}
export interface ConnectionErrorHandler {
    (error: Error, message: Message | undefined, count: number | undefined): void;
}
export interface ConnectionCloseHandler {
    (): void;
}
export interface IConnectionProvider {
    get(errorHandler: ConnectionErrorHandler, closeHandler: ConnectionCloseHandler, outputChannel: OutputChannel | undefined): Thenable<IConnection>;
}
export declare function createConnection(connection: MessageConnection, errorHandler: ConnectionErrorHandler, closeHandler: ConnectionCloseHandler): IConnection;
//# sourceMappingURL=connection.d.ts.map