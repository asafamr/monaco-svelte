/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
    Message,
    RequestType, RequestType0, RequestHandler, RequestHandler0, GenericRequestHandler,
    NotificationType, NotificationType0,
    NotificationHandler, NotificationHandler0, GenericNotificationHandler,
    Trace, Tracer, CancellationToken, MessageConnection, MessageSignature, Disposable
} from 'vscode-jsonrpc';

import {
    InitializeRequest, InitializeParams, InitializeResult,
    ShutdownRequest, ExitNotification,
    LogMessageNotification, LogMessageParams,
    ShowMessageNotification, ShowMessageParams,
    TelemetryEventNotification,
    DidChangeConfigurationNotification, DidChangeConfigurationParams,
    DidOpenTextDocumentNotification, DidOpenTextDocumentParams,
    DidChangeTextDocumentNotification, DidChangeTextDocumentParams,
    DidCloseTextDocumentNotification, DidCloseTextDocumentParams,
    DidSaveTextDocumentNotification, DidSaveTextDocumentParams,
    DidChangeWatchedFilesNotification, DidChangeWatchedFilesParams,
    PublishDiagnosticsNotification, PublishDiagnosticsParams
} from 'vscode-languageserver-protocol';

import * as Is from 'vscode-languageserver-protocol/lib/common/utils/is';

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
    end(): void
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
export function createConnection(connection: MessageConnection, errorHandler: ConnectionErrorHandler, closeHandler: ConnectionCloseHandler): IConnection {
    connection.onError((data) => { errorHandler(data[0], data[1], data[2]) });
    connection.onClose(closeHandler);
    return {

        listen: (): void => connection.listen(),

        sendRequest: <R>(type: string | MessageSignature, ...params: any[]): Thenable<R> => connection.sendRequest(Is.string(type) ? type : type.method, ...params),
        onRequest: <R, E>(type: string | MessageSignature, handler: GenericRequestHandler<R, E>): Disposable => connection.onRequest(Is.string(type) ? type : type.method, handler),

        sendNotification: (type: string | MessageSignature, params?: any): void => connection.sendNotification(Is.string(type) ? type : type.method, params),
        onNotification: (type: string | MessageSignature, handler: GenericNotificationHandler): Disposable => connection.onNotification(Is.string(type) ? type : type.method, handler),

        trace: (value: Trace, tracer: Tracer, sendNotification: boolean = false): void => connection.trace(value, tracer, sendNotification),

        initialize: (params: InitializeParams) => connection.sendRequest(InitializeRequest.type, params),
        shutdown: () => connection.sendRequest(ShutdownRequest.type, undefined),
        exit: () => connection.sendNotification(ExitNotification.type),

        onLogMessage: (handler: NotificationHandler<LogMessageParams>) => connection.onNotification(LogMessageNotification.type, handler),
        onShowMessage: (handler: NotificationHandler<ShowMessageParams>) => connection.onNotification(ShowMessageNotification.type, handler),
        onTelemetry: (handler: NotificationHandler<any>) => connection.onNotification(TelemetryEventNotification.type, handler),

        didChangeConfiguration: (params: DidChangeConfigurationParams) => connection.sendNotification(DidChangeConfigurationNotification.type, params),
        didChangeWatchedFiles: (params: DidChangeWatchedFilesParams) => connection.sendNotification(DidChangeWatchedFilesNotification.type, params),

        didOpenTextDocument: (params: DidOpenTextDocumentParams) => connection.sendNotification(DidOpenTextDocumentNotification.type, params),
        didChangeTextDocument: (params: DidChangeTextDocumentParams) => connection.sendNotification(DidChangeTextDocumentNotification.type, params),
        didCloseTextDocument: (params: DidCloseTextDocumentParams) => connection.sendNotification(DidCloseTextDocumentNotification.type, params),
        didSaveTextDocument: (params: DidSaveTextDocumentParams) => connection.sendNotification(DidSaveTextDocumentNotification.type, params),

        onDiagnostics: (handler: NotificationHandler<PublishDiagnosticsParams>) => connection.onNotification(PublishDiagnosticsNotification.type, handler),

        dispose: () => connection.dispose(),
        end: () => connection.end()
    };
}