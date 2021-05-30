"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisposableCollection = exports.Disposable = void 0;
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const services_1 = require("./services");
Object.defineProperty(exports, "Disposable", { enumerable: true, get: function () { return services_1.Disposable; } });
class DisposableCollection {
    constructor() {
        this.disposables = [];
    }
    dispose() {
        while (this.disposables.length !== 0) {
            this.disposables.pop().dispose();
        }
    }
    push(disposable) {
        const disposables = this.disposables;
        disposables.push(disposable);
        return {
            dispose() {
                const index = disposables.indexOf(disposable);
                if (index !== -1) {
                    disposables.splice(index, 1);
                }
            }
        };
    }
}
exports.DisposableCollection = DisposableCollection;
//# sourceMappingURL=disposable.js.map