"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonacoCommands = void 0;
class MonacoCommands {
    constructor(_monaco) {
        this._monaco = _monaco;
    }
    registerCommand(command, callback, thisArg) {
        return this._monaco.editor.registerCommand(command, (accessor, ...args) => callback.call(thisArg, ...args));
    }
}
exports.MonacoCommands = MonacoCommands;
//# sourceMappingURL=monaco-commands.js.map