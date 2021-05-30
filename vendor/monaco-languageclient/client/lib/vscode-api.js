"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVSCodeApi = void 0;
const vscode = require("vscode");
const vscode_uri_1 = require("vscode-uri");
const disposable_1 = require("./disposable");
const services_1 = require("./services");
const ServicesModule = require("./services");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
function createVSCodeApi(servicesProvider) {
    const unsupported = () => { throw new Error('unsupported'); };
    const Uri = class VSCodeUri extends vscode_uri_1.URI {
        static joinPath(uri, ...pathFragment) {
            return unsupported();
        }
    };
    class CompletionItem {
        constructor(label, kind) {
            this.label = label;
            this.kind = kind;
        }
    }
    class CodeLens {
        constructor(range, command) {
            this.range = range;
            this.command = command;
        }
        get isResolved() {
            return !!this.command;
        }
    }
    class DocumentLink {
        constructor(range, target) {
            this.range = range;
            this.target = target;
        }
    }
    class CodeActionKind {
        constructor(value) {
            this.value = value;
            this.contains = unsupported;
            this.intersects = unsupported;
        }
        append(parts) {
            return new CodeActionKind(this.value ? this.value + CodeActionKind.sep + parts : parts);
        }
    }
    CodeActionKind.sep = '.';
    CodeActionKind.Empty = new CodeActionKind('');
    CodeActionKind.QuickFix = new CodeActionKind('quickfix');
    CodeActionKind.Refactor = new CodeActionKind('refactor');
    CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append('extract');
    CodeActionKind.RefactorInline = CodeActionKind.Refactor.append('inline');
    CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append('rewrite');
    CodeActionKind.Source = new CodeActionKind('source');
    CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append('organizeImports');
    CodeActionKind.SourceFixAll = CodeActionKind.Source.append('fixAll');
    class Diagnostic {
        constructor(range, message, severity = vscode_languageserver_protocol_1.DiagnosticSeverity.Error) {
            this.range = range;
            this.message = message;
            this.severity = severity;
        }
    }
    class CallHierarchyItem {
        constructor(kind, name, detail, uri, range, selectionRange) {
            this.kind = kind;
            this.name = name;
            this.detail = detail;
            this.uri = uri;
            this.range = range;
            this.selectionRange = selectionRange;
        }
    }
    class CodeAction {
        constructor(title, kind) {
            this.title = title;
            this.kind = kind;
        }
    }
    class SemanticTokens {
        constructor(data, resultId) {
            this.data = data;
            this.resultId = resultId;
        }
    }
    class EmptyFileSystem {
        isWritableFileSystem(scheme) {
            return false;
        }
        stat(uri) {
            throw new Error("Method not implemented.");
        }
        readDirectory(uri) {
            return Promise.resolve([]);
        }
        createDirectory(uri) {
            return Promise.resolve();
        }
        readFile(uri) {
            return Promise.resolve(new Uint8Array(0));
        }
        writeFile(uri, content) {
            return Promise.resolve();
        }
        delete(uri, options) {
            return Promise.resolve();
        }
        rename(source, target, options) {
            return Promise.resolve();
        }
        copy(source, target, options) {
            return Promise.resolve();
        }
    }
    const workspace = {
        fs: new EmptyFileSystem(),
        workspaceFile: undefined,
        createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            const services = servicesProvider();
            if (typeof globPattern !== 'string') {
                throw new Error('unsupported');
            }
            if (services.workspace.createFileSystemWatcher) {
                const watcher = services.workspace.createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
                return Object.assign(watcher, {
                    ignoreCreateEvents: !!ignoreCreateEvents,
                    ignoreChangeEvents: !!ignoreChangeEvents,
                    ignoreDeleteEvents: !!ignoreDeleteEvents,
                });
            }
            return {
                ignoreCreateEvents: !!ignoreCreateEvents,
                ignoreChangeEvents: !!ignoreChangeEvents,
                ignoreDeleteEvents: !!ignoreDeleteEvents,
                onDidCreate: services_1.Event.None,
                onDidChange: services_1.Event.None,
                onDidDelete: services_1.Event.None,
                dispose: () => { }
            };
        },
        applyEdit: (edit) => __awaiter(this, void 0, void 0, function* () {
            const services = servicesProvider();
            if (services_1.WorkspaceEdit.is(edit)) {
                return services.workspace.applyEdit(edit);
            }
            throw new Error('unsupported');
        }),
        getConfiguration(section, resource) {
            const { workspace } = servicesProvider();
            const configuration = workspace.configurations ?
                workspace.configurations.getConfiguration(section, resource ? resource.toString() : undefined) :
                undefined;
            const result = {
                get: (section, defaultValue) => {
                    return configuration ? configuration.get(section, defaultValue) : defaultValue;
                },
                has: (section) => {
                    return configuration ? configuration.has(section) : false;
                },
                inspect: unsupported,
                update: unsupported
            };
            return Object.assign(result, {
                toJSON: () => configuration ? configuration.toJSON() : undefined
            });
        },
        get onDidChangeConfiguration() {
            const services = servicesProvider();
            if (services.workspace.configurations) {
                return services.workspace.configurations.onDidChangeConfiguration;
            }
            return services_1.Event.None;
        },
        get workspaceFolders() {
            const services = servicesProvider();
            if ('workspaceFolders' in services.workspace) {
                return services.workspace.workspaceFolders;
            }
            const rootUri = services.workspace.rootUri;
            if (!rootUri) {
                return undefined;
            }
            const uri = Uri.parse(rootUri);
            return [{
                    uri,
                    index: 0,
                    name: uri.toString()
                }];
        },
        get onDidChangeWorkspaceFolders() {
            const services = servicesProvider();
            return services.workspace.onDidChangeWorkspaceFolders || services_1.Event.None;
        },
        get textDocuments() {
            const services = servicesProvider();
            return services.workspace.textDocuments;
        },
        get onDidOpenTextDocument() {
            const services = servicesProvider();
            return services.workspace.onDidOpenTextDocument;
        },
        get onDidCloseTextDocument() {
            const services = servicesProvider();
            return services.workspace.onDidCloseTextDocument;
        },
        get onDidChangeTextDocument() {
            const services = servicesProvider();
            return (listener, thisArgs, disposables) => {
                return services.workspace.onDidChangeTextDocument(({ textDocument, contentChanges }) => {
                    const l = listener.bind(thisArgs);
                    l({
                        document: textDocument,
                        contentChanges: contentChanges
                    });
                }, undefined, disposables);
            };
        },
        get onWillSaveTextDocument() {
            const services = servicesProvider();
            const onWillSaveTextDocument = services.workspace.onWillSaveTextDocument;
            if (!onWillSaveTextDocument) {
                return services_1.Event.None;
            }
            return (listener, thisArgs, disposables) => {
                return onWillSaveTextDocument(({ textDocument, reason, waitUntil }) => {
                    const l = listener.bind(thisArgs);
                    l({
                        document: textDocument,
                        reason: reason,
                        waitUntil: (edits) => {
                            if (waitUntil) {
                                waitUntil(edits);
                            }
                        }
                    });
                }, undefined, disposables);
            };
        },
        get onDidSaveTextDocument() {
            const services = servicesProvider();
            return services.workspace.onDidSaveTextDocument || services_1.Event.None;
        },
        get onWillCreateFiles() {
            return services_1.Event.None;
        },
        get onDidCreateFiles() {
            return services_1.Event.None;
        },
        get onWillDeleteFiles() {
            return services_1.Event.None;
        },
        get onDidDeleteFiles() {
            return services_1.Event.None;
        },
        get onWillRenameFiles() {
            return services_1.Event.None;
        },
        get onDidRenameFiles() {
            return services_1.Event.None;
        },
        getWorkspaceFolder: unsupported,
        asRelativePath: unsupported,
        updateWorkspaceFolders: unsupported,
        findFiles: unsupported,
        saveAll: unsupported,
        openTextDocument: unsupported,
        registerTextDocumentContentProvider: unsupported,
        registerTaskProvider: unsupported,
        registerFileSystemProvider: unsupported,
        rootPath: undefined,
        name: undefined
    };
    function isVsCodeUri(v) {
        return (v instanceof vscode_uri_1.URI) !== undefined;
    }
    class ApiDiagnosticCollection {
        constructor(name) {
            this.name = name || 'default',
                this.services = servicesProvider();
            this.collection = this.services.languages.createDiagnosticCollection
                ? this.services.languages.createDiagnosticCollection(name)
                : undefined;
        }
        entries() {
        }
        set(arg0, arg1) {
            function toInternalSeverity(severity) {
                // there is a typing mismatch, trying to use the proper switch
                // mixes error with warnings etc...
                // just cast for now, this as the correct behaviour
                return severity;
                // we don't want to rely on the runtime vscode module here, so we use our version
                // of the enum
                /*
                switch ((severity as unknown) as VsCodeDiagnosticSeverity)
                {
                    case VsCodeDiagnosticSeverity.Warning:
                        return DiagnosticSeverity.Warning;
                    case VsCodeDiagnosticSeverity.Information:
                        return DiagnosticSeverity.Information;
                    case VsCodeDiagnosticSeverity.Hint:
                        return DiagnosticSeverity.Hint;
                    case VsCodeDiagnosticSeverity.Error:
                        return DiagnosticSeverity.Error;
                }
                return DiagnosticSeverity.Error;
                // */
            }
            function toInternalCode(code) {
                if (code != null && typeof code === 'object') {
                    return code.value;
                }
                return code;
            }
            if (isVsCodeUri(arg0)) {
                if (this.collection) {
                    if (arg1) {
                        this.collection.set(arg0.toString(), arg1.map(diag => {
                            return {
                                range: diag.range,
                                code: toInternalCode(diag.code),
                                source: diag.source,
                                message: diag.message,
                                tags: diag.tags,
                                relatedInformation: undefined,
                                severity: toInternalSeverity(diag.severity)
                            };
                        }));
                    }
                    else {
                        this.collection.set(arg0.toString(), []);
                    }
                }
            }
            else {
                arg0.forEach(element => {
                    this.set(element[0], element[1]);
                });
            }
        }
        dispose() {
            if (this.collection) {
                this.collection.dispose();
            }
        }
        delete(uri) { }
        clear() { }
        forEach(callback, thisArg) { }
        get(uri) { return undefined; }
        has(uri) { return false; }
    }
    const languages = {
        match(selector, document) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            if (!services_1.DocumentIdentifier.is(document)) {
                throw new Error('unexpected document: ' + JSON.stringify(document));
            }
            const services = servicesProvider();
            const result = services.languages.match(selector, document);
            return result ? 1 : 0;
        },
        registerCallHierarchyProvider(selector, provider) {
            /* empty stub for now */
            return {
                dispose() {
                }
            };
        },
        createDiagnosticCollection(name) {
            return new ApiDiagnosticCollection(name);
        },
        registerCompletionItemProvider(selector, provider, ...triggerCharacters) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerCompletionItemProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            const resolveCompletionItem = provider.resolveCompletionItem;
            return languages.registerCompletionItemProvider(selector, {
                provideCompletionItems({ textDocument, position, context }, token) {
                    return provider.provideCompletionItems(textDocument, position, token, context || {
                        triggerKind: services_1.CompletionTriggerKind.Invoked
                    });
                },
                resolveCompletionItem: resolveCompletionItem ? (item, token) => {
                    return resolveCompletionItem(item, token);
                } : undefined
            }, ...triggerCharacters);
        },
        registerCodeActionsProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerCodeActionsProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerCodeActionsProvider(selector, {
                provideCodeActions({ textDocument, range, context }, token) {
                    return provider.provideCodeActions(textDocument, range, context, token);
                }
            });
        },
        registerCodeLensProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerCodeLensProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            const resolveCodeLens = provider.resolveCodeLens;
            return languages.registerCodeLensProvider(selector, {
                provideCodeLenses({ textDocument }, token) {
                    return provider.provideCodeLenses(textDocument, token);
                },
                resolveCodeLens: resolveCodeLens ? (codeLens, token) => {
                    return resolveCodeLens(codeLens, token);
                } : undefined
            });
        },
        registerDefinitionProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDefinitionProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDefinitionProvider(selector, {
                provideDefinition({ textDocument, position }, token) {
                    return provider.provideDefinition(textDocument, position, token);
                }
            });
        },
        registerImplementationProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerImplementationProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerImplementationProvider(selector, {
                provideImplementation({ textDocument, position }, token) {
                    return provider.provideImplementation(textDocument, position, token);
                }
            });
        },
        registerTypeDefinitionProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerTypeDefinitionProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerTypeDefinitionProvider(selector, {
                provideTypeDefinition({ textDocument, position }, token) {
                    return provider.provideTypeDefinition(textDocument, position, token);
                }
            });
        },
        registerDeclarationProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDeclarationProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDeclarationProvider(selector, {
                provideDeclaration({ textDocument, position }, token) {
                    return provider.provideDeclaration(textDocument, position, token);
                }
            });
        },
        registerHoverProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (languages.registerHoverProvider) {
                return languages.registerHoverProvider(selector, {
                    provideHover({ textDocument, position }, token) {
                        return provider.provideHover(textDocument, position, token);
                    }
                });
            }
            return disposable_1.Disposable.create(() => { });
        },
        registerDocumentHighlightProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDocumentHighlightProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDocumentHighlightProvider(selector, {
                provideDocumentHighlights({ textDocument, position }, token) {
                    return provider.provideDocumentHighlights(textDocument, position, token);
                }
            });
        },
        registerDocumentSymbolProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDocumentSymbolProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDocumentSymbolProvider(selector, {
                provideDocumentSymbols({ textDocument }, token) {
                    return provider.provideDocumentSymbols(textDocument, token);
                }
            });
        },
        registerWorkspaceSymbolProvider(provider) {
            const { languages } = servicesProvider();
            if (!languages.registerWorkspaceSymbolProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerWorkspaceSymbolProvider({
                provideWorkspaceSymbols({ query }, token) {
                    return provider.provideWorkspaceSymbols(query, token);
                }
            });
        },
        registerReferenceProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerReferenceProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerReferenceProvider(selector, {
                provideReferences({ textDocument, position, context }, token) {
                    return provider.provideReferences(textDocument, position, context, token);
                }
            });
        },
        registerRenameProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerRenameProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerRenameProvider(selector, {
                provideRenameEdits({ textDocument, position, newName }, token) {
                    return provider.provideRenameEdits(textDocument, position, newName, token);
                }
            });
        },
        registerDocumentFormattingEditProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDocumentFormattingEditProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDocumentFormattingEditProvider(selector, {
                provideDocumentFormattingEdits({ textDocument, options }, token) {
                    return provider.provideDocumentFormattingEdits(textDocument, options, token);
                }
            });
        },
        registerDocumentRangeFormattingEditProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDocumentRangeFormattingEditProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDocumentRangeFormattingEditProvider(selector, {
                provideDocumentRangeFormattingEdits({ textDocument, range, options }, token) {
                    return provider.provideDocumentRangeFormattingEdits(textDocument, range, options, token);
                }
            });
        },
        registerOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacter) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerOnTypeFormattingEditProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerOnTypeFormattingEditProvider(selector, {
                provideOnTypeFormattingEdits({ textDocument, position, ch, options }, token) {
                    return provider.provideOnTypeFormattingEdits(textDocument, position, ch, options, token);
                }
            }, firstTriggerCharacter, ...moreTriggerCharacter);
        },
        registerSignatureHelpProvider(selector, provider, firstItem, ...remaining) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerSignatureHelpProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            let triggerCharacters;
            let retriggerCharacters;
            if (typeof firstItem === 'string') {
                triggerCharacters = [firstItem, ...remaining];
            }
            else if (firstItem) {
                triggerCharacters = firstItem.triggerCharacters;
                retriggerCharacters = firstItem.retriggerCharacters;
            }
            return languages.registerSignatureHelpProvider(selector, {
                triggerCharacters,
                retriggerCharacters,
                provideSignatureHelp({ textDocument, position }, token, context) {
                    return provider.provideSignatureHelp(textDocument, position, token, context);
                }
            });
        },
        registerDocumentLinkProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDocumentLinkProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            const resolveDocumentLink = provider.resolveDocumentLink;
            return languages.registerDocumentLinkProvider(selector, {
                provideDocumentLinks({ textDocument }, token) {
                    return provider.provideDocumentLinks(textDocument, token);
                },
                resolveDocumentLink: resolveDocumentLink ? (link, token) => {
                    return resolveDocumentLink(link, token);
                } : undefined
            });
        },
        registerColorProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerColorProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerColorProvider(selector, {
                provideDocumentColors({ textDocument }, token) {
                    return provider.provideDocumentColors(textDocument, token);
                },
                provideColorPresentations({ textDocument, color, range }, token) {
                    return provider.provideColorPresentations(color, {
                        document: textDocument,
                        range: range
                    }, token);
                }
            });
        },
        registerFoldingRangeProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerFoldingRangeProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerFoldingRangeProvider(selector, {
                provideFoldingRanges({ textDocument }, token) {
                    return provider.provideFoldingRanges(textDocument, {}, token);
                }
            });
        },
        registerSelectionRangeProvider(selector, provider) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerSelectionRangeProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerSelectionRangeProvider(selector, {
                provideSelectionRanges({ textDocument, positions }, token) {
                    return provider.provideSelectionRanges(textDocument, positions, token);
                }
            });
        },
        registerEvaluatableExpressionProvider: unsupported,
        registerDocumentSemanticTokensProvider(selector, provider, legend) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDocumentSemanticTokensProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDocumentSemanticTokensProvider(selector, {
                provideDocumentSemanticTokens({ textDocument }, token) {
                    return provider.provideDocumentSemanticTokens(textDocument, token);
                },
                provideDocumentSemanticTokensEdits: provider.provideDocumentSemanticTokensEdits && (({ textDocument, previousResultId }, token) => {
                    return provider.provideDocumentSemanticTokensEdits(textDocument, previousResultId, token);
                })
            }, legend);
        },
        registerDocumentRangeSemanticTokensProvider(selector, provider, legend) {
            if (!services_1.isDocumentSelector(selector)) {
                throw new Error('unexpected selector: ' + JSON.stringify(selector));
            }
            const { languages } = servicesProvider();
            if (!languages.registerDocumentRangeSemanticTokensProvider) {
                return disposable_1.Disposable.create(() => { });
            }
            return languages.registerDocumentRangeSemanticTokensProvider(selector, {
                provideDocumentRangeSemanticTokens({ textDocument, range }, token) {
                    return provider.provideDocumentRangeSemanticTokens(textDocument, range, token);
                }
            }, legend);
        },
        getLanguages: unsupported,
        setTextDocumentLanguage: unsupported,
        getDiagnostics: unsupported,
        setLanguageConfiguration: unsupported,
        onDidChangeDiagnostics: unsupported,
        registerLinkedEditingRangeProvider: unsupported
    };
    function showMessage(type, arg0, ...arg1) {
        if (typeof arg0 !== "string") {
            throw new Error('unexpected message: ' + JSON.stringify(arg0));
        }
        const message = arg0;
        if (arg1 !== undefined && !Array.isArray(arg1)) {
            throw new Error('unexpected actions: ' + JSON.stringify(arg1));
        }
        const actions = arg1 || [];
        const { window } = servicesProvider();
        if (!window) {
            return Promise.resolve(undefined);
        }
        return window.showMessage(type, message, ...actions);
    }
    const window = {
        showInformationMessage: showMessage.bind(undefined, services_1.MessageType.Info),
        showWarningMessage: showMessage.bind(undefined, services_1.MessageType.Warning),
        showErrorMessage: showMessage.bind(undefined, services_1.MessageType.Error),
        createOutputChannel(name) {
            const { window } = servicesProvider();
            const createOutputChannel = window ? window.createOutputChannel : undefined;
            const channel = createOutputChannel ? createOutputChannel.bind(window)(name) : undefined;
            return {
                name,
                append: channel ? channel.append.bind(channel) : () => { },
                appendLine: channel ? channel.appendLine.bind(channel) : () => { },
                clear: unsupported,
                show: (arg) => {
                    if (arg !== undefined && typeof arg !== 'boolean') {
                        throw new Error('unexpected preserveFocus argument: ' + JSON.stringify(arg, undefined, 4));
                    }
                    return channel ? channel.show(arg) : () => { };
                },
                hide: unsupported,
                dispose: channel ? channel.dispose.bind(channel) : () => { }
            };
        },
        withProgress: (options, task) => {
            const { window } = servicesProvider();
            if (window && window.withProgress) {
                return window.withProgress(options, task);
            }
            return task({ report: () => { } }, new vscode.CancellationTokenSource().token);
        },
        showTextDocument: unsupported,
        createTextEditorDecorationType: unsupported,
        showQuickPick: unsupported,
        showWorkspaceFolderPick: unsupported,
        showOpenDialog: unsupported,
        showSaveDialog: unsupported,
        showInputBox: unsupported,
        createWebviewPanel: unsupported,
        setStatusBarMessage: unsupported,
        withScmProgress: unsupported,
        createStatusBarItem: unsupported,
        createTerminal: unsupported,
        registerTreeDataProvider: unsupported,
        createTreeView: unsupported,
        registerWebviewPanelSerializer: unsupported,
        get activeTextEditor() {
            return unsupported();
        },
        get visibleTextEditors() {
            return unsupported();
        },
        onDidChangeActiveTextEditor: unsupported,
        onDidChangeVisibleTextEditors: unsupported,
        onDidChangeTextEditorSelection: unsupported,
        onDidChangeTextEditorVisibleRanges: unsupported,
        onDidChangeTextEditorOptions: unsupported,
        onDidChangeTextEditorViewColumn: unsupported,
        get terminals() {
            return unsupported();
        },
        get activeTerminal() {
            return unsupported();
        },
        onDidChangeActiveTerminal: unsupported,
        onDidOpenTerminal: unsupported,
        onDidCloseTerminal: unsupported,
        get state() {
            return unsupported();
        },
        onDidChangeWindowState: unsupported,
        createQuickPick: unsupported,
        createInputBox: unsupported,
        registerUriHandler: unsupported,
        registerWebviewViewProvider: unsupported,
        registerCustomEditorProvider: unsupported,
        registerTerminalLinkProvider: unsupported,
        get activeColorTheme() {
            return unsupported();
        },
        onDidChangeActiveColorTheme: unsupported,
        registerFileDecorationProvider: unsupported
    };
    const commands = {
        registerCommand(command, callback, thisArg) {
            const { commands } = servicesProvider();
            if (!commands) {
                return disposable_1.Disposable.create(() => { });
            }
            return commands.registerCommand(command, callback, thisArg);
        },
        registerTextEditorCommand: unsupported,
        executeCommand: unsupported,
        getCommands: unsupported
    };
    class CodeDisposable {
        constructor(callOnDispose) {
            this.callOnDispose = callOnDispose;
        }
        static from(...inDisposables) {
            let disposables = inDisposables;
            return new CodeDisposable(function () {
                if (disposables) {
                    for (const disposable of disposables) {
                        if (disposable && typeof disposable.dispose === 'function') {
                            disposable.dispose();
                        }
                    }
                    disposables = undefined;
                }
            });
        }
        dispose() {
            this.callOnDispose();
        }
    }
    const env = {
        appName: 'Monaco',
        appRoot: '',
        language: navigator.language || 'en-US',
        get uriScheme() {
            return unsupported();
        },
        get clipboard() {
            return unsupported();
        },
        get machineId() {
            return unsupported();
        },
        get sessionId() {
            return unsupported();
        },
        remoteName: undefined,
        shell: '',
        uiKind: 2,
        asExternalUri: unsupported,
        openExternal: unsupported
    };
    const partialApi = {
        workspace,
        languages,
        window,
        commands,
        env,
        Uri,
        CompletionItem,
        CodeLens,
        DocumentLink,
        CodeActionKind,
        CodeAction,
        Diagnostic,
        CallHierarchyItem,
        SemanticTokens,
        Disposable: CodeDisposable,
        SignatureHelpTriggerKind: services_1.SignatureHelpTriggerKind,
        DiagnosticSeverity: ServicesModule.DiagnosticSeverity,
        EventEmitter: ServicesModule.Emitter
    };
    return partialApi;
}
exports.createVSCodeApi = createVSCodeApi;
//# sourceMappingURL=vscode-api.js.map