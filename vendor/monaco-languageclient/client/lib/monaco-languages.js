"use strict";
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
exports.MonacoLanguages = exports.testGlob = exports.MonacoModelIdentifier = void 0;
const globToRegExp = require("glob-to-regexp");
const services_1 = require("./services");
const monaco_diagnostic_collection_1 = require("./monaco-diagnostic-collection");
const disposable_1 = require("./disposable");
var MonacoModelIdentifier;
(function (MonacoModelIdentifier) {
    function fromDocument(_monaco, document) {
        return {
            uri: _monaco.Uri.parse(document.uri),
            languageId: document.languageId
        };
    }
    MonacoModelIdentifier.fromDocument = fromDocument;
    function fromModel(model) {
        return {
            uri: model.uri,
            languageId: model.getModeId()
        };
    }
    MonacoModelIdentifier.fromModel = fromModel;
})(MonacoModelIdentifier = exports.MonacoModelIdentifier || (exports.MonacoModelIdentifier = {}));
function testGlob(pattern, value) {
    const regExp = globToRegExp(pattern, {
        extended: true,
        globstar: true
    });
    return regExp.test(value);
}
exports.testGlob = testGlob;
class MonacoLanguages {
    constructor(_monaco, p2m, m2p) {
        this._monaco = _monaco;
        this.p2m = p2m;
        this.m2p = m2p;
    }
    match(selector, document) {
        return this.matchModel(selector, MonacoModelIdentifier.fromDocument(this._monaco, document));
    }
    createDiagnosticCollection(name) {
        return new monaco_diagnostic_collection_1.MonacoDiagnosticCollection(this._monaco, name || 'default', this.p2m);
    }
    registerCompletionItemProvider(selector, provider, ...triggerCharacters) {
        const completionProvider = this.createCompletionProvider(selector, provider, ...triggerCharacters);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerCompletionItemProvider(language, completionProvider));
        }
        ;
        return providers;
    }
    createCompletionProvider(selector, provider, ...triggerCharacters) {
        return {
            triggerCharacters,
            provideCompletionItems: (model, position, context, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const wordUntil = model.getWordUntilPosition(position);
                const defaultRange = new this._monaco.Range(position.lineNumber, wordUntil.startColumn, position.lineNumber, wordUntil.endColumn);
                const params = this.m2p.asCompletionParams(model, position, context);
                const result = yield provider.provideCompletionItems(params, token);
                return result && this.p2m.asCompletionResult(result, defaultRange);
            }),
            resolveCompletionItem: provider.resolveCompletionItem ? (item, token) => __awaiter(this, void 0, void 0, function* () {
                const protocolItem = this.m2p.asCompletionItem(item);
                const resolvedItem = yield provider.resolveCompletionItem(protocolItem, token);
                if (resolvedItem) {
                    const resolvedCompletionItem = this.p2m.asCompletionItem(resolvedItem, item.range);
                    Object.assign(item, resolvedCompletionItem);
                }
                return item;
            }) : undefined
        };
    }
    registerHoverProvider(selector, provider) {
        const hoverProvider = this.createHoverProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerHoverProvider(language, hoverProvider));
        }
        return providers;
    }
    createHoverProvider(selector, provider) {
        return {
            provideHover: (model, position, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asTextDocumentPositionParams(model, position);
                const hover = yield provider.provideHover(params, token);
                return hover && this.p2m.asHover(hover);
            })
        };
    }
    registerSignatureHelpProvider(selector, provider, ...triggerCharacters) {
        const signatureHelpProvider = this.createSignatureHelpProvider(selector, provider, ...triggerCharacters);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerSignatureHelpProvider(language, signatureHelpProvider));
        }
        return providers;
    }
    createSignatureHelpProvider(selector, provider, ...triggerCharacters) {
        const signatureHelpTriggerCharacters = [...(provider.triggerCharacters || triggerCharacters || [])];
        return {
            signatureHelpTriggerCharacters,
            signatureHelpRetriggerCharacters: provider.retriggerCharacters,
            provideSignatureHelp: (model, position, token, context) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asTextDocumentPositionParams(model, position);
                const signatureHelp = yield provider.provideSignatureHelp(params, token, this.m2p.asSignatureHelpContext(context));
                return signatureHelp && this.p2m.asSignatureHelpResult(signatureHelp);
            })
        };
    }
    registerDefinitionProvider(selector, provider) {
        const definitionProvider = this.createDefinitionProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerDefinitionProvider(language, definitionProvider));
        }
        return providers;
    }
    createDefinitionProvider(selector, provider) {
        return {
            provideDefinition: (model, position, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asTextDocumentPositionParams(model, position);
                const result = yield provider.provideDefinition(params, token);
                return result && this.p2m.asDefinitionResult(result);
            })
        };
    }
    registerReferenceProvider(selector, provider) {
        const referenceProvider = this.createReferenceProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerReferenceProvider(language, referenceProvider));
        }
        return providers;
    }
    createReferenceProvider(selector, provider) {
        return {
            provideReferences: (model, position, context, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asReferenceParams(model, position, context);
                const result = yield provider.provideReferences(params, token);
                return result && this.p2m.asReferences(result);
            })
        };
    }
    registerDocumentHighlightProvider(selector, provider) {
        const documentHighlightProvider = this.createDocumentHighlightProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerDocumentHighlightProvider(language, documentHighlightProvider));
        }
        return providers;
    }
    createDocumentHighlightProvider(selector, provider) {
        return {
            provideDocumentHighlights: (model, position, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asTextDocumentPositionParams(model, position);
                const result = yield provider.provideDocumentHighlights(params, token);
                return result && this.p2m.asDocumentHighlights(result);
            })
        };
    }
    registerDocumentSymbolProvider(selector, provider) {
        const documentSymbolProvider = this.createDocumentSymbolProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerDocumentSymbolProvider(language, documentSymbolProvider));
        }
        return providers;
    }
    createDocumentSymbolProvider(selector, provider) {
        return {
            provideDocumentSymbols: (model, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asDocumentSymbolParams(model);
                const result = yield provider.provideDocumentSymbols(params, token);
                return result && this.p2m.asDocumentSymbols(result);
            })
        };
    }
    registerCodeActionsProvider(selector, provider) {
        const codeActionProvider = this.createCodeActionProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerCodeActionProvider(language, codeActionProvider));
        }
        return providers;
    }
    createCodeActionProvider(selector, provider) {
        return {
            provideCodeActions: (model, range, context, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    // FIXME: get rid of `!` when https://github.com/microsoft/monaco-editor/issues/1560 is resolved
                    return undefined;
                }
                const params = this.m2p.asCodeActionParams(model, range, context);
                const result = yield provider.provideCodeActions(params, token);
                // FIXME: get rid of `|| undefined!` when https://github.com/microsoft/monaco-editor/issues/1560 is resolved
                return result && this.p2m.asCodeActionList(result) || undefined;
            })
        };
    }
    registerCodeLensProvider(selector, provider) {
        const codeLensProvider = this.createCodeLensProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerCodeLensProvider(language, codeLensProvider));
        }
        return providers;
    }
    createCodeLensProvider(selector, provider) {
        return {
            provideCodeLenses: (model, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asCodeLensParams(model);
                const result = yield provider.provideCodeLenses(params, token);
                return result && this.p2m.asCodeLensList(result);
            }),
            resolveCodeLens: provider.resolveCodeLens ? (model, codeLens, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return codeLens;
                }
                const protocolCodeLens = this.m2p.asCodeLens(codeLens);
                const result = yield provider.resolveCodeLens(protocolCodeLens, token);
                if (result) {
                    const resolvedCodeLens = this.p2m.asCodeLens(result);
                    Object.assign(codeLens, resolvedCodeLens);
                }
                return codeLens;
            }) : ((_, codeLens) => codeLens)
        };
    }
    registerDocumentFormattingEditProvider(selector, provider) {
        const documentFormattingEditProvider = this.createDocumentFormattingEditProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerDocumentFormattingEditProvider(language, documentFormattingEditProvider));
        }
        return providers;
    }
    createDocumentFormattingEditProvider(selector, provider) {
        return {
            provideDocumentFormattingEdits: (model, options, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asDocumentFormattingParams(model, options);
                const result = yield provider.provideDocumentFormattingEdits(params, token);
                return result && this.p2m.asTextEdits(result);
            })
        };
    }
    registerDocumentRangeFormattingEditProvider(selector, provider) {
        const documentRangeFormattingEditProvider = this.createDocumentRangeFormattingEditProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerDocumentRangeFormattingEditProvider(language, documentRangeFormattingEditProvider));
        }
        return providers;
    }
    createDocumentRangeFormattingEditProvider(selector, provider) {
        return {
            provideDocumentRangeFormattingEdits: (model, range, options, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asDocumentRangeFormattingParams(model, range, options);
                const result = yield provider.provideDocumentRangeFormattingEdits(params, token);
                return result && this.p2m.asTextEdits(result);
            })
        };
    }
    registerOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacter) {
        const onTypeFormattingEditProvider = this.createOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacter);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerOnTypeFormattingEditProvider(language, onTypeFormattingEditProvider));
        }
        return providers;
    }
    createOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacter) {
        const autoFormatTriggerCharacters = [firstTriggerCharacter].concat(moreTriggerCharacter);
        return {
            autoFormatTriggerCharacters,
            provideOnTypeFormattingEdits: (model, position, ch, options, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asDocumentOnTypeFormattingParams(model, position, ch, options);
                const result = yield provider.provideOnTypeFormattingEdits(params, token);
                return result && this.p2m.asTextEdits(result);
            })
        };
    }
    registerRenameProvider(selector, provider) {
        const renameProvider = this.createRenameProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerRenameProvider(language, renameProvider));
        }
        return providers;
    }
    createRenameProvider(selector, provider) {
        return {
            provideRenameEdits: (model, position, newName, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asRenameParams(model, position, newName);
                const result = yield provider.provideRenameEdits(params, token);
                return result && this.p2m.asWorkspaceEdit(result);
            })
        };
    }
    registerDocumentLinkProvider(selector, provider) {
        const linkProvider = this.createDocumentLinkProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerLinkProvider(language, linkProvider));
        }
        return providers;
    }
    createDocumentLinkProvider(selector, provider) {
        return {
            provideLinks: (model, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asDocumentLinkParams(model);
                const result = yield provider.provideDocumentLinks(params, token);
                return result && this.p2m.asDocumentLinks(result);
            }),
            resolveLink: (link, token) => __awaiter(this, void 0, void 0, function* () {
                // resolve the link if the provider supports it
                // and the link doesn't have a url set
                if (provider.resolveDocumentLink && (link.url === null || link.url === undefined)) {
                    const documentLink = this.m2p.asDocumentLink(link);
                    const result = yield provider.resolveDocumentLink(documentLink, token);
                    if (result) {
                        const resolvedLink = this.p2m.asDocumentLink(result);
                        Object.assign(link, resolvedLink);
                    }
                }
                return link;
            })
        };
    }
    registerImplementationProvider(selector, provider) {
        const implementationProvider = this.createImplementationProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerImplementationProvider(language, implementationProvider));
        }
        return providers;
    }
    createImplementationProvider(selector, provider) {
        return {
            provideImplementation: (model, position, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asTextDocumentPositionParams(model, position);
                const result = yield provider.provideImplementation(params, token);
                return result && this.p2m.asDefinitionResult(result);
            })
        };
    }
    registerTypeDefinitionProvider(selector, provider) {
        const typeDefinitionProvider = this.createTypeDefinitionProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerTypeDefinitionProvider(language, typeDefinitionProvider));
        }
        return providers;
    }
    createTypeDefinitionProvider(selector, provider) {
        return {
            provideTypeDefinition: (model, position, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const params = this.m2p.asTextDocumentPositionParams(model, position);
                const result = yield provider.provideTypeDefinition(params, token);
                return result && this.p2m.asDefinitionResult(result);
            })
        };
    }
    registerColorProvider(selector, provider) {
        const documentColorProvider = this.createDocumentColorProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerColorProvider(language, documentColorProvider));
        }
        return providers;
    }
    createDocumentColorProvider(selector, provider) {
        return {
            provideDocumentColors: (model, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const textDocument = this.m2p.asTextDocumentIdentifier(model);
                const result = yield provider.provideDocumentColors({ textDocument }, token);
                return result && this.p2m.asColorInformations(result);
            }),
            provideColorPresentations: (model, info, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const textDocument = this.m2p.asTextDocumentIdentifier(model);
                const range = this.m2p.asRange(info.range);
                const result = yield provider.provideColorPresentations({
                    textDocument,
                    color: info.color,
                    range
                }, token);
                return result && this.p2m.asColorPresentations(result);
            })
        };
    }
    registerFoldingRangeProvider(selector, provider) {
        const foldingRangeProvider = this.createFoldingRangeProvider(selector, provider);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerFoldingRangeProvider(language, foldingRangeProvider));
        }
        return providers;
    }
    createFoldingRangeProvider(selector, provider) {
        return {
            provideFoldingRanges: (model, context, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const textDocument = this.m2p.asTextDocumentIdentifier(model);
                const result = yield provider.provideFoldingRanges({
                    textDocument
                }, token);
                return result && this.p2m.asFoldingRanges(result);
            })
        };
    }
    registerDocumentSemanticTokensProvider(selector, provider, legend) {
        const semanticTokensProvider = this.createSemanticTokensProvider(selector, provider, legend);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerDocumentSemanticTokensProvider(language, semanticTokensProvider));
        }
        return providers;
    }
    createSemanticTokensProvider(selector, provider, legend) {
        return {
            getLegend() {
                return legend;
            },
            provideDocumentSemanticTokens: (model, lastResultId, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const textDocument = this.m2p.asTextDocumentIdentifier(model);
                const result = yield provider.provideDocumentSemanticTokens({
                    textDocument
                }, token);
                return result && this.p2m.asSemanticTokens(result);
            }),
            releaseDocumentSemanticTokens: (resultId) => {
            }
        };
    }
    registerDocumentRangeSemanticTokensProvider(selector, provider, legend) {
        const rangeSemanticTokensProvider = this.createRangeSemanticTokensProvider(selector, provider, legend);
        const providers = new disposable_1.DisposableCollection();
        for (const language of this.matchLanguage(selector)) {
            providers.push(this._monaco.languages.registerDocumentRangeSemanticTokensProvider(language, rangeSemanticTokensProvider));
        }
        return providers;
    }
    createRangeSemanticTokensProvider(selector, provider, legend) {
        return {
            getLegend() {
                return legend;
            },
            provideDocumentRangeSemanticTokens: (model, range, token) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
                    return undefined;
                }
                const textDocument = this.m2p.asTextDocumentIdentifier(model);
                const result = yield provider.provideDocumentRangeSemanticTokens({
                    textDocument,
                    range: this.m2p.asRange(range)
                }, token);
                return result && this.p2m.asSemanticTokens(result);
            })
        };
    }
    matchModel(selector, model) {
        if (Array.isArray(selector)) {
            return selector.some(filter => this.matchModel(filter, model));
        }
        if (services_1.DocumentFilter.is(selector)) {
            if (!!selector.language && selector.language !== model.languageId) {
                return false;
            }
            if (!!selector.scheme && selector.scheme !== model.uri.scheme) {
                return false;
            }
            if (!!selector.pattern && !testGlob(selector.pattern, model.uri.path)) {
                return false;
            }
            return true;
        }
        return selector === model.languageId;
    }
    matchLanguage(selector) {
        const languages = new Set();
        if (Array.isArray(selector)) {
            for (const filter of selector) {
                languages.add(this.matchLanguageByFilter(filter));
            }
        }
        else {
            languages.add(this.matchLanguageByFilter(selector));
        }
        return languages;
    }
    matchLanguageByFilter(selector) {
        if (services_1.DocumentFilter.is(selector)) {
            if (!selector.language) {
                return '*';
            }
            return selector.language;
        }
        return selector;
    }
}
exports.MonacoLanguages = MonacoLanguages;
//# sourceMappingURL=monaco-languages.js.map