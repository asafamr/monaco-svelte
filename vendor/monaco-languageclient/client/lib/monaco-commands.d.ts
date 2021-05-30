import type * as monaco from 'monaco-editor-core';
import { Commands, Disposable } from './services';
export declare class MonacoCommands implements Commands {
    protected readonly _monaco: typeof monaco;
    constructor(_monaco: typeof monaco);
    registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable;
}
//# sourceMappingURL=monaco-commands.d.ts.map