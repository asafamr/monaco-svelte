"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonacoServices = void 0;
const monaco_converter_1 = require("./monaco-converter");
const monaco_commands_1 = require("./monaco-commands");
const monaco_languages_1 = require("./monaco-languages");
const monaco_workspace_1 = require("./monaco-workspace");
const console_window_1 = require("./console-window");
const services_1 = require("./services");
var MonacoServices;
(function (MonacoServices) {
    function create(_monaco, options = {}) {
        const m2p = new monaco_converter_1.MonacoToProtocolConverter(_monaco);
        const p2m = new monaco_converter_1.ProtocolToMonacoConverter(_monaco);
        return {
            commands: new monaco_commands_1.MonacoCommands(_monaco),
            languages: new monaco_languages_1.MonacoLanguages(_monaco, p2m, m2p),
            workspace: new monaco_workspace_1.MonacoWorkspace(_monaco, p2m, m2p, options.rootUri),
            window: new console_window_1.ConsoleWindow()
        };
    }
    MonacoServices.create = create;
    function install(_monaco, options = {}) {
        const services = create(_monaco, options);
        services_1.Services.install(services);
        return services;
    }
    MonacoServices.install = install;
    function get() {
        return services_1.Services.get();
    }
    MonacoServices.get = get;
})(MonacoServices = exports.MonacoServices || (exports.MonacoServices = {}));
//# sourceMappingURL=monaco-services.js.map