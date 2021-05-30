"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Module = module.parent.require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id, options) {
    const resolvedId = id === 'vscode' ? path.resolve(__dirname, 'vscode-compatibility.js') : id;
    return originalRequire.call(this, resolvedId, options);
};
//# sourceMappingURL=register-vscode.js.map