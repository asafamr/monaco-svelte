"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleWindow = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const services_1 = require("./services");
class ConsoleWindow {
    constructor() {
        this.channels = new Map();
    }
    showMessage(type, message, ...actions) {
        if (type === services_1.MessageType.Error) {
            console.error(message);
        }
        if (type === services_1.MessageType.Warning) {
            console.warn(message);
        }
        if (type === services_1.MessageType.Info) {
            console.info(message);
        }
        if (type === services_1.MessageType.Log) {
            console.log(message);
        }
        return Promise.resolve(undefined);
    }
    createOutputChannel(name) {
        const existing = this.channels.get(name);
        if (existing) {
            return existing;
        }
        const channel = {
            append(value) {
                console.log(name + ': ' + value);
            },
            appendLine(line) {
                console.log(name + ': ' + line);
            },
            show() {
                // no-op
            },
            dispose() {
                // no-op
            }
        };
        this.channels.set(name, channel);
        return channel;
    }
}
exports.ConsoleWindow = ConsoleWindow;
//# sourceMappingURL=console-window.js.map