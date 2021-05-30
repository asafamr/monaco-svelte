import { BaseLanguageClient, MessageTransports, LanguageClientOptions } from "vscode-languageclient/lib/common/client";
import { IConnectionProvider, IConnection } from './connection';
export * from 'vscode-languageclient/lib/common/client';
export declare class MonacoLanguageClient extends BaseLanguageClient {
    static bypassConversion: (result: any) => any;
    protected readonly connectionProvider: IConnectionProvider;
    constructor({ id, name, clientOptions, connectionProvider }: MonacoLanguageClient.Options);
    protected doCreateConnection(): Thenable<IConnection>;
    protected createMessageTransports(encoding: string): Promise<MessageTransports>;
    protected registerBuiltinFeatures(): void;
    registerProposedFeatures(): void;
    protected getLocale(): string;
}
export declare namespace MonacoLanguageClient {
    interface Options {
        name: string;
        id?: string;
        clientOptions: LanguageClientOptions;
        connectionProvider: IConnectionProvider;
    }
}
//# sourceMappingURL=monaco-language-client.d.ts.map