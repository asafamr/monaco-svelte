"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolToMonacoConverter = exports.MonacoToProtocolConverter = exports.ProtocolCodeAction = exports.ProtocolCompletionItem = exports.ProtocolCodeLens = exports.ProtocolDocumentLink = void 0;
const ls = require("vscode-languageserver-protocol");
const Is = require("vscode-languageserver-protocol/lib/common/utils/is");
const services_1 = require("./services");
var ProtocolDocumentLink;
(function (ProtocolDocumentLink) {
    function is(item) {
        return !!item && 'data' in item;
    }
    ProtocolDocumentLink.is = is;
})(ProtocolDocumentLink = exports.ProtocolDocumentLink || (exports.ProtocolDocumentLink = {}));
var ProtocolCodeLens;
(function (ProtocolCodeLens) {
    function is(item) {
        return !!item && 'data' in item;
    }
    ProtocolCodeLens.is = is;
})(ProtocolCodeLens = exports.ProtocolCodeLens || (exports.ProtocolCodeLens = {}));
var ProtocolCompletionItem;
(function (ProtocolCompletionItem) {
    function is(item) {
        return !!item && 'data' in item;
    }
    ProtocolCompletionItem.is = is;
})(ProtocolCompletionItem = exports.ProtocolCompletionItem || (exports.ProtocolCompletionItem = {}));
var ProtocolCodeAction;
(function (ProtocolCodeAction) {
    function is(item) {
        return !!item && 'data' in item;
    }
    ProtocolCodeAction.is = is;
})(ProtocolCodeAction = exports.ProtocolCodeAction || (exports.ProtocolCodeAction = {}));
function isRangeReplace(v) {
    return v.insert !== undefined;
}
class MonacoToProtocolConverter {
    constructor(_monaco) {
        this._monaco = _monaco;
    }
    asPosition(lineNumber, column) {
        const line = lineNumber === undefined || lineNumber === null ? undefined : lineNumber - 1;
        const character = column === undefined || column === null ? undefined : column - 1;
        return {
            line, character
        };
    }
    asRange(range) {
        if (range === undefined) {
            return undefined;
        }
        if (range === null) {
            return null;
        }
        if (isRangeReplace(range)) {
            return this.asRange(range.insert);
        }
        else {
            const start = this.asPosition(range.startLineNumber, range.startColumn);
            const end = this.asPosition(range.endLineNumber, range.endColumn);
            return {
                start, end
            };
        }
    }
    asTextDocumentIdentifier(model) {
        return {
            uri: model.uri.toString()
        };
    }
    asTextDocumentPositionParams(model, position) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column)
        };
    }
    asCompletionParams(model, position, context) {
        return Object.assign(this.asTextDocumentPositionParams(model, position), {
            context: this.asCompletionContext(context)
        });
    }
    asCompletionContext(context) {
        return {
            triggerKind: this.asCompletionTriggerKind(context.triggerKind),
            triggerCharacter: context.triggerCharacter
        };
    }
    asSignatureHelpContext(context) {
        return {
            triggerKind: this.asSignatureHelpTriggerKind(context.triggerKind),
            triggerCharacter: context.triggerCharacter,
            isRetrigger: context.isRetrigger,
            activeSignatureHelp: this.asSignatureHelp(context.activeSignatureHelp)
        };
    }
    asSignatureHelp(signatureHelp) {
        if (signatureHelp === undefined) {
            return undefined;
        }
        return {
            signatures: signatureHelp.signatures.map(signatureInfo => this.asSignatureInformation(signatureInfo)),
            activeParameter: signatureHelp.activeParameter,
            activeSignature: signatureHelp.activeSignature
        };
    }
    asSignatureInformation(signatureInformation) {
        return {
            documentation: this.asMarkupContent(signatureInformation.documentation),
            label: signatureInformation.label,
            parameters: signatureInformation.parameters.map(paramInfo => this.asParameterInformation(paramInfo)),
            activeParameter: signatureInformation.activeParameter
        };
    }
    asParameterInformation(parameterInformation) {
        return {
            documentation: this.asMarkupContent(parameterInformation.documentation),
            label: parameterInformation.label
        };
    }
    asMarkupContent(markupContent) {
        if (markupContent === undefined) {
            return undefined;
        }
        if (typeof markupContent === "string") {
            return markupContent;
        }
        return {
            kind: services_1.MarkupKind.Markdown,
            value: markupContent.value
        };
    }
    asSignatureHelpTriggerKind(triggerKind) {
        switch (triggerKind) {
            case this._monaco.languages.SignatureHelpTriggerKind.ContentChange:
                return services_1.SignatureHelpTriggerKind.ContentChange;
            case this._monaco.languages.SignatureHelpTriggerKind.TriggerCharacter:
                return services_1.SignatureHelpTriggerKind.TriggerCharacter;
            default:
                return services_1.SignatureHelpTriggerKind.Invoke;
        }
    }
    asCompletionTriggerKind(triggerKind) {
        switch (triggerKind) {
            case this._monaco.languages.CompletionTriggerKind.TriggerCharacter:
                return services_1.CompletionTriggerKind.TriggerCharacter;
            case this._monaco.languages.CompletionTriggerKind.TriggerForIncompleteCompletions:
                return services_1.CompletionTriggerKind.TriggerForIncompleteCompletions;
            default:
                return services_1.CompletionTriggerKind.Invoked;
        }
    }
    asCompletionItem(item) {
        const result = { label: item.label };
        const protocolItem = ProtocolCompletionItem.is(item) ? item : undefined;
        if (item.detail) {
            result.detail = item.detail;
        }
        // We only send items back we created. So this can't be something else than
        // a string right now.
        if (item.documentation) {
            if (!protocolItem || !protocolItem.documentationFormat) {
                result.documentation = item.documentation;
            }
            else {
                result.documentation = this.asDocumentation(protocolItem.documentationFormat, item.documentation);
            }
        }
        if (item.filterText) {
            result.filterText = item.filterText;
        }
        this.fillPrimaryInsertText(result, item);
        if (Is.number(item.kind)) {
            result.kind = this.asCompletionItemKind(item.kind, protocolItem && protocolItem.originalItemKind);
        }
        if (item.sortText) {
            result.sortText = item.sortText;
        }
        if (item.additionalTextEdits) {
            result.additionalTextEdits = this.asTextEdits(item.additionalTextEdits);
        }
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (item.commitCharacters) {
            result.commitCharacters = item.commitCharacters.slice();
        }
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        // TODO if (item.preselect === true || item.preselect === false) { result.preselect = item.preselect; }
        if (protocolItem) {
            if (protocolItem.data !== undefined) {
                result.data = protocolItem.data;
            }
            if (protocolItem.deprecated === true || protocolItem.deprecated === false) {
                result.deprecated = protocolItem.deprecated;
            }
        }
        return result;
    }
    asCompletionItemKind(value, original) {
        if (original !== undefined) {
            return original;
        }
        switch (value) {
            case this._monaco.languages.CompletionItemKind.Method: return services_1.CompletionItemKind.Method;
            case this._monaco.languages.CompletionItemKind.Function: return services_1.CompletionItemKind.Function;
            case this._monaco.languages.CompletionItemKind.Constructor: return services_1.CompletionItemKind.Constructor;
            case this._monaco.languages.CompletionItemKind.Field: return services_1.CompletionItemKind.Field;
            case this._monaco.languages.CompletionItemKind.Variable: return services_1.CompletionItemKind.Variable;
            case this._monaco.languages.CompletionItemKind.Class: return services_1.CompletionItemKind.Class;
            case this._monaco.languages.CompletionItemKind.Struct: return services_1.CompletionItemKind.Struct;
            case this._monaco.languages.CompletionItemKind.Interface: return services_1.CompletionItemKind.Interface;
            case this._monaco.languages.CompletionItemKind.Module: return services_1.CompletionItemKind.Module;
            case this._monaco.languages.CompletionItemKind.Property: return services_1.CompletionItemKind.Property;
            case this._monaco.languages.CompletionItemKind.Event: return services_1.CompletionItemKind.Event;
            case this._monaco.languages.CompletionItemKind.Operator: return services_1.CompletionItemKind.Operator;
            case this._monaco.languages.CompletionItemKind.Unit: return services_1.CompletionItemKind.Unit;
            case this._monaco.languages.CompletionItemKind.Value: return services_1.CompletionItemKind.Value;
            case this._monaco.languages.CompletionItemKind.Constant: return services_1.CompletionItemKind.Constant;
            case this._monaco.languages.CompletionItemKind.Enum: return services_1.CompletionItemKind.Enum;
            case this._monaco.languages.CompletionItemKind.EnumMember: return services_1.CompletionItemKind.EnumMember;
            case this._monaco.languages.CompletionItemKind.Keyword: return services_1.CompletionItemKind.Keyword;
            case this._monaco.languages.CompletionItemKind.Text: return services_1.CompletionItemKind.Text;
            case this._monaco.languages.CompletionItemKind.Color: return services_1.CompletionItemKind.Color;
            case this._monaco.languages.CompletionItemKind.File: return services_1.CompletionItemKind.File;
            case this._monaco.languages.CompletionItemKind.Reference: return services_1.CompletionItemKind.Reference;
            case this._monaco.languages.CompletionItemKind.Customcolor: return services_1.CompletionItemKind.Color;
            case this._monaco.languages.CompletionItemKind.Folder: return services_1.CompletionItemKind.Folder;
            case this._monaco.languages.CompletionItemKind.TypeParameter: return services_1.CompletionItemKind.TypeParameter;
            case this._monaco.languages.CompletionItemKind.Snippet: return services_1.CompletionItemKind.Snippet;
            default: return value + 1;
        }
    }
    asDocumentation(format, documentation) {
        switch (format) {
            case services_1.MarkupKind.PlainText:
                return { kind: format, value: documentation };
            case services_1.MarkupKind.Markdown:
                return { kind: format, value: documentation.value };
            default:
                return `Unsupported Markup content received. Kind is: ${format}`;
        }
    }
    fillPrimaryInsertText(target, source) {
        let format = services_1.InsertTextFormat.PlainText;
        let text;
        let range;
        if (source.insertTextRules !== undefined && (source.insertTextRules & this._monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet) === 0) {
            format = services_1.InsertTextFormat.Snippet;
            text = source.insertText;
        }
        target.insertTextFormat = format;
        text = source.insertText;
        if (source.range) {
            range = this.asRange(source.range);
        }
        target.insertTextFormat = format;
        if (source.fromEdit && text && range) {
            target.textEdit = { newText: text, range: range };
        }
        else {
            target.insertText = text;
        }
        target.insertTextMode = source.insertTextMode;
    }
    asTextEdit(edit) {
        const range = this.asRange(edit.range);
        return {
            range,
            newText: edit.text || ''
        };
    }
    asTextEdits(items) {
        if (!items) {
            return undefined;
        }
        return items.map(item => this.asTextEdit(item));
    }
    asReferenceParams(model, position, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column),
            context: { includeDeclaration: options.includeDeclaration }
        };
    }
    asDocumentSymbolParams(model) {
        return {
            textDocument: this.asTextDocumentIdentifier(model)
        };
    }
    asCodeLensParams(model) {
        return {
            textDocument: this.asTextDocumentIdentifier(model)
        };
    }
    asDiagnosticSeverity(value) {
        switch (value) {
            case this._monaco.MarkerSeverity.Error:
                return services_1.DiagnosticSeverity.Error;
            case this._monaco.MarkerSeverity.Warning:
                return services_1.DiagnosticSeverity.Warning;
            case this._monaco.MarkerSeverity.Info:
                return services_1.DiagnosticSeverity.Information;
            case this._monaco.MarkerSeverity.Hint:
                return services_1.DiagnosticSeverity.Hint;
        }
        return undefined;
    }
    asDiagnostic(marker) {
        const range = this.asRange(new this._monaco.Range(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn));
        const severity = this.asDiagnosticSeverity(marker.severity);
        return services_1.Diagnostic.create(range, marker.message, severity, marker.code, marker.source);
    }
    asDiagnostics(markers) {
        if (markers === void 0 || markers === null) {
            return markers;
        }
        return markers.map(marker => this.asDiagnostic(marker));
    }
    asCodeActionContext(context) {
        if (context === void 0 || context === null) {
            return context;
        }
        const diagnostics = this.asDiagnostics(context.markers);
        return services_1.CodeActionContext.create(diagnostics, Is.string(context.only) ? [context.only] : undefined);
    }
    asCodeActionParams(model, range, context) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            range: this.asRange(range),
            context: this.asCodeActionContext(context)
        };
    }
    asCommand(item) {
        if (item) {
            let args = item.arguments || [];
            return services_1.Command.create(item.title, item.id, ...args);
        }
        return undefined;
    }
    asCodeLens(item) {
        let result = services_1.CodeLens.create(this.asRange(item.range));
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (ProtocolCodeLens.is(item)) {
            if (item.data) {
                result.data = item.data;
            }
            ;
        }
        return result;
    }
    asFormattingOptions(options) {
        return { tabSize: options.tabSize, insertSpaces: options.insertSpaces };
    }
    asDocumentFormattingParams(model, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            options: this.asFormattingOptions(options)
        };
    }
    asDocumentRangeFormattingParams(model, range, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            range: this.asRange(range),
            options: this.asFormattingOptions(options)
        };
    }
    asDocumentOnTypeFormattingParams(model, position, ch, options) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column),
            ch,
            options: this.asFormattingOptions(options)
        };
    }
    asRenameParams(model, position, newName) {
        return {
            textDocument: this.asTextDocumentIdentifier(model),
            position: this.asPosition(position.lineNumber, position.column),
            newName
        };
    }
    asDocumentLinkParams(model) {
        return {
            textDocument: this.asTextDocumentIdentifier(model)
        };
    }
    asDocumentLink(item) {
        let result = services_1.DocumentLink.create(this.asRange(item.range));
        if (item.url) {
            result.target = typeof item.url === 'string' ? item.url : item.url.toString();
        }
        if (ProtocolDocumentLink.is(item) && item.data) {
            result.data = item.data;
        }
        if (item.tooltip) {
            result.tooltip = item.tooltip;
        }
        return result;
    }
    asCodeAction(item) {
        const result = { title: item.title };
        const protocolCodeAction = ProtocolCodeAction.is(item) ? item : undefined;
        if (Is.number(item.kind)) {
            result.kind = item.kind;
        }
        if (item.diagnostics) {
            result.diagnostics = this.asDiagnostics(item.diagnostics);
        }
        if (item.edit) {
            throw new Error(`VS Code code actions can only be converted to a protocol code action without an edit.`);
        }
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (item.isPreferred !== undefined) {
            result.isPreferred = item.isPreferred;
        }
        if (item.disabled) {
            result.disabled = { reason: item.disabled };
        }
        if (protocolCodeAction) {
            if (protocolCodeAction.data !== undefined) {
                result.data = protocolCodeAction.data;
            }
        }
        return result;
    }
}
exports.MonacoToProtocolConverter = MonacoToProtocolConverter;
class ProtocolToMonacoConverter {
    constructor(_monaco) {
        this._monaco = _monaco;
    }
    asResourceEdits(resource, edits, asMetadata, modelVersionId) {
        return edits.map(edit => ({
            resource: resource,
            edit: this.asTextEdit(edit),
            modelVersionId,
            metadata: services_1.AnnotatedTextEdit.is(edit) ? asMetadata(edit.annotationId) : undefined
        }));
    }
    asWorkspaceEditMetadata(changeAnnotation) {
        return {
            needsConfirmation: changeAnnotation.needsConfirmation === true,
            label: changeAnnotation.label,
            description: changeAnnotation.description
        };
    }
    asWorkspaceEdit(item) {
        if (!item) {
            return undefined;
        }
        const sharedMetadata = new Map();
        if (item.changeAnnotations !== undefined) {
            for (const key of Object.keys(item.changeAnnotations)) {
                const metaData = this.asWorkspaceEditMetadata(item.changeAnnotations[key]);
                sharedMetadata.set(key, metaData);
            }
        }
        const asMetadata = (annotation) => {
            if (annotation === undefined) {
                return undefined;
            }
            else {
                return sharedMetadata.get(annotation);
            }
        };
        const edits = [];
        if (item.documentChanges) {
            item.documentChanges.forEach(change => {
                if (ls.CreateFile.is(change)) {
                    edits.push({
                        newUri: this._monaco.Uri.parse(change.uri),
                        options: change.options,
                        metadata: asMetadata(change.annotationId)
                    });
                }
                else if (ls.RenameFile.is(change)) {
                    edits.push({
                        oldUri: this._monaco.Uri.parse(change.oldUri),
                        newUri: this._monaco.Uri.parse(change.newUri),
                        options: change.options,
                        metadata: asMetadata(change.annotationId)
                    });
                }
                else if (ls.DeleteFile.is(change)) {
                    edits.push({
                        oldUri: this._monaco.Uri.parse(change.uri),
                        options: change.options,
                        metadata: asMetadata(change.annotationId)
                    });
                }
                else if (ls.TextDocumentEdit.is(change)) {
                    const resource = this._monaco.Uri.parse(change.textDocument.uri);
                    const version = typeof change.textDocument.version === 'number' ? change.textDocument.version : undefined;
                    edits.push(...this.asResourceEdits(resource, change.edits, asMetadata, version));
                }
                else {
                    console.error(`Unknown workspace edit change received:\n${JSON.stringify(change, undefined, 4)}`);
                }
            });
        }
        else if (item.changes) {
            for (const key of Object.keys(item.changes)) {
                const resource = this._monaco.Uri.parse(key);
                edits.push(...this.asResourceEdits(resource, item.changes[key], asMetadata));
            }
        }
        return {
            edits
        };
    }
    asTextEdit(edit) {
        if (!edit) {
            return undefined;
        }
        const range = this.asRange(edit.range);
        return {
            range,
            text: edit.newText
        };
    }
    asTextEdits(items) {
        if (!items) {
            return undefined;
        }
        return items.map(item => this.asTextEdit(item));
    }
    asCodeLens(item) {
        if (!item) {
            return undefined;
        }
        const range = this.asRange(item.range);
        let result = { range };
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (item.data !== void 0 && item.data !== null) {
            result.data = item.data;
        }
        return result;
    }
    asCodeLensList(items) {
        if (!items) {
            return undefined;
        }
        return {
            lenses: items.map((codeLens) => this.asCodeLens(codeLens)),
            dispose: () => { }
        };
    }
    asCodeActionList(actions) {
        return {
            actions: actions.map(action => this.asCodeAction(action)),
            dispose: () => { }
        };
    }
    asCodeAction(item) {
        if (services_1.CodeAction.is(item)) {
            return {
                title: item.title,
                command: this.asCommand(item.command),
                edit: this.asWorkspaceEdit(item.edit),
                diagnostics: this.asDiagnostics(item.diagnostics),
                kind: item.kind,
                disabled: item.disabled ? item.disabled.reason : undefined,
                isPreferred: item.isPreferred,
                data: item.data
            };
        }
        return {
            command: {
                id: item.command,
                title: item.title,
                arguments: item.arguments
            },
            title: item.title
        };
    }
    asCommand(command) {
        if (!command) {
            return undefined;
        }
        return {
            id: command.command,
            title: command.title,
            arguments: command.arguments
        };
    }
    asDocumentSymbol(value) {
        const children = value.children && value.children.map(c => this.asDocumentSymbol(c));
        return {
            name: value.name,
            detail: value.detail || "",
            kind: this.asSymbolKind(value.kind),
            tags: value.tags || [],
            range: this.asRange(value.range),
            selectionRange: this.asRange(value.selectionRange),
            children
        };
    }
    asDocumentSymbols(values) {
        if (services_1.DocumentSymbol.is(values[0])) {
            return values.map(s => this.asDocumentSymbol(s));
        }
        return this.asSymbolInformations(values);
    }
    asSymbolInformations(values, uri) {
        if (!values) {
            return undefined;
        }
        return values.map(information => this.asSymbolInformation(information, uri));
    }
    asSymbolInformation(item, uri) {
        const location = this.asLocation(uri ? Object.assign(Object.assign({}, item.location), { uri: uri.toString() }) : item.location);
        return {
            name: item.name,
            detail: '',
            containerName: item.containerName,
            kind: this.asSymbolKind(item.kind),
            tags: item.tags || [],
            range: location.range,
            selectionRange: location.range
        };
    }
    asSymbolKind(item) {
        if (item <= services_1.SymbolKind.TypeParameter) {
            // Symbol kind is one based in the protocol and zero based in code.
            return item - 1;
        }
        return this._monaco.languages.SymbolKind.Property;
    }
    asDocumentHighlights(values) {
        if (!values) {
            return undefined;
        }
        return values.map(item => this.asDocumentHighlight(item));
    }
    asDocumentHighlight(item) {
        const range = this.asRange(item.range);
        const kind = Is.number(item.kind) ? this.asDocumentHighlightKind(item.kind) : undefined;
        return { range, kind };
    }
    asDocumentHighlightKind(item) {
        switch (item) {
            case services_1.DocumentHighlightKind.Text:
                return this._monaco.languages.DocumentHighlightKind.Text;
            case services_1.DocumentHighlightKind.Read:
                return this._monaco.languages.DocumentHighlightKind.Read;
            case services_1.DocumentHighlightKind.Write:
                return this._monaco.languages.DocumentHighlightKind.Write;
        }
        return this._monaco.languages.DocumentHighlightKind.Text;
    }
    asReferences(values) {
        if (!values) {
            return undefined;
        }
        return values.map(location => this.asLocation(location));
    }
    asDefinitionResult(item) {
        if (!item) {
            return undefined;
        }
        if (Is.array(item)) {
            if (item.length == 0) {
                return undefined;
            }
            else if (services_1.LocationLink.is(item[0])) {
                let links = item;
                return links.map((location) => this.asLocationLink(location));
            }
            else {
                let locations = item;
                return locations.map((location) => this.asLocation(location));
            }
        }
        else {
            return this.asLocation(item);
        }
    }
    asLocation(item) {
        if (!item) {
            return undefined;
        }
        const uri = this._monaco.Uri.parse(item.uri);
        const range = this.asRange(item.range);
        return {
            uri, range
        };
    }
    asLocationLink(item) {
        if (!item) {
            return undefined;
        }
        let result = {
            uri: this._monaco.Uri.parse(item.targetUri),
            range: this.asRange(item.targetSelectionRange),
            originSelectionRange: this.asRange(item.originSelectionRange),
            targetSelectionRange: this.asRange(item.targetSelectionRange)
        };
        if (!result.targetSelectionRange) {
            throw new Error(`targetSelectionRange must not be undefined or null`);
        }
        return result;
    }
    asSignatureHelpResult(item) {
        if (!item) {
            return undefined;
        }
        let result = {};
        if (Is.number(item.activeSignature)) {
            result.activeSignature = item.activeSignature;
        }
        else {
            // activeSignature was optional in the past
            result.activeSignature = 0;
        }
        if (Is.number(item.activeParameter)) {
            result.activeParameter = item.activeParameter;
        }
        else {
            // activeParameter was optional in the past
            result.activeParameter = 0;
        }
        if (item.signatures) {
            result.signatures = this.asSignatureInformations(item.signatures);
        }
        else {
            result.signatures = [];
        }
        return {
            value: result,
            dispose: () => { }
        };
    }
    asSignatureInformations(items) {
        return items.map(item => this.asSignatureInformation(item));
    }
    asSignatureInformation(item) {
        let result = { label: item.label };
        if (item.documentation) {
            result.documentation = this.asDocumentation(item.documentation);
        }
        if (item.parameters) {
            result.parameters = this.asParameterInformations(item.parameters);
        }
        else {
            result.parameters = [];
        }
        if (item.activeParameter) {
            result.activeParameter = item.activeParameter;
        }
        return result;
    }
    asParameterInformations(item) {
        return item.map(item => this.asParameterInformation(item));
    }
    asParameterInformation(item) {
        let result = { label: item.label };
        if (item.documentation) {
            result.documentation = this.asDocumentation(item.documentation);
        }
        ;
        return result;
    }
    asHover(hover) {
        if (!hover) {
            return undefined;
        }
        return {
            contents: this.asHoverContent(hover.contents),
            range: this.asRange(hover.range)
        };
    }
    asHoverContent(contents) {
        if (Array.isArray(contents)) {
            return contents.map(content => this.asMarkdownString(content));
        }
        return [this.asMarkdownString(contents)];
    }
    asDocumentation(value) {
        if (Is.string(value)) {
            return value;
        }
        if (value.kind === services_1.MarkupKind.PlainText) {
            return value.value;
        }
        return this.asMarkdownString(value);
    }
    asMarkdownString(content) {
        if (services_1.MarkupContent.is(content)) {
            return {
                value: content.value
            };
        }
        if (Is.string(content)) {
            return { value: content };
        }
        const { language, value } = content;
        return {
            value: '```' + language + '\n' + value + '\n```'
        };
    }
    asSeverity(severity) {
        if (severity === 1) {
            return this._monaco.MarkerSeverity.Error;
        }
        if (severity === 2) {
            return this._monaco.MarkerSeverity.Warning;
        }
        if (severity === 3) {
            return this._monaco.MarkerSeverity.Info;
        }
        return this._monaco.MarkerSeverity.Hint;
    }
    asDiagnostics(diagnostics) {
        if (!diagnostics) {
            return undefined;
        }
        return diagnostics.map(diagnostic => this.asDiagnostic(diagnostic));
    }
    asDiagnostic(diagnostic) {
        return {
            code: typeof diagnostic.code === "number" ? diagnostic.code.toString() : diagnostic.code,
            severity: this.asSeverity(diagnostic.severity),
            message: diagnostic.message,
            source: diagnostic.source,
            startLineNumber: diagnostic.range.start.line + 1,
            startColumn: diagnostic.range.start.character + 1,
            endLineNumber: diagnostic.range.end.line + 1,
            endColumn: diagnostic.range.end.character + 1,
            relatedInformation: this.asRelatedInformations(diagnostic.relatedInformation)
        };
    }
    asRelatedInformations(relatedInformation) {
        if (!relatedInformation) {
            return undefined;
        }
        return relatedInformation.map(item => this.asRelatedInformation(item));
    }
    asRelatedInformation(relatedInformation) {
        return {
            resource: this._monaco.Uri.parse(relatedInformation.location.uri),
            startLineNumber: relatedInformation.location.range.start.line + 1,
            startColumn: relatedInformation.location.range.start.character + 1,
            endLineNumber: relatedInformation.location.range.end.line + 1,
            endColumn: relatedInformation.location.range.end.character + 1,
            message: relatedInformation.message
        };
    }
    asCompletionResult(result, defaultRange) {
        if (!result) {
            return {
                incomplete: false,
                suggestions: []
            };
        }
        if (Array.isArray(result)) {
            const suggestions = result.map(item => this.asCompletionItem(item, defaultRange));
            return {
                incomplete: false,
                suggestions
            };
        }
        return {
            incomplete: result.isIncomplete,
            suggestions: result.items.map(item => this.asCompletionItem(item, defaultRange))
        };
    }
    asCompletionItem(item, defaultRange) {
        const result = { label: item.label };
        if (item.detail) {
            result.detail = item.detail;
        }
        if (item.documentation) {
            result.documentation = this.asDocumentation(item.documentation);
            result.documentationFormat = Is.string(item.documentation) ? undefined : item.documentation.kind;
        }
        ;
        if (item.filterText) {
            result.filterText = item.filterText;
        }
        const insertText = this.asCompletionInsertText(item, defaultRange);
        result.insertText = insertText.insertText;
        result.range = insertText.range;
        result.fromEdit = insertText.fromEdit;
        if (insertText.isSnippet) {
            result.insertTextRules = this._monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        }
        if (Is.number(item.kind)) {
            let [itemKind, original] = this.asCompletionItemKind(item.kind);
            result.kind = itemKind;
            if (original) {
                result.originalItemKind = original;
            }
        }
        if (item.sortText) {
            result.sortText = item.sortText;
        }
        if (item.additionalTextEdits) {
            result.additionalTextEdits = this.asTextEdits(item.additionalTextEdits);
        }
        if (Is.stringArray(item.commitCharacters)) {
            result.commitCharacters = item.commitCharacters.slice();
        }
        if (item.command) {
            result.command = this.asCommand(item.command);
        }
        if (item.deprecated === true || item.deprecated === false) {
            result.deprecated = item.deprecated;
        }
        if (item.preselect === true || item.preselect === false) {
            result.preselect = item.preselect;
        }
        if (item.data !== undefined) {
            result.data = item.data;
        }
        if (item.deprecated === true || item.deprecated === false) {
            result.deprecated = item.deprecated;
        }
        result.insertTextMode = item.insertTextMode;
        return result;
    }
    asCompletionItemKind(value) {
        if (services_1.CompletionItemKind.Text <= value && value <= services_1.CompletionItemKind.TypeParameter) {
            switch (value) {
                case services_1.CompletionItemKind.Text: return [this._monaco.languages.CompletionItemKind.Text, undefined];
                case services_1.CompletionItemKind.Method: return [this._monaco.languages.CompletionItemKind.Method, undefined];
                case services_1.CompletionItemKind.Function: return [this._monaco.languages.CompletionItemKind.Function, undefined];
                case services_1.CompletionItemKind.Constructor: return [this._monaco.languages.CompletionItemKind.Constructor, undefined];
                case services_1.CompletionItemKind.Field: return [this._monaco.languages.CompletionItemKind.Field, undefined];
                case services_1.CompletionItemKind.Variable: return [this._monaco.languages.CompletionItemKind.Variable, undefined];
                case services_1.CompletionItemKind.Class: return [this._monaco.languages.CompletionItemKind.Class, undefined];
                case services_1.CompletionItemKind.Interface: return [this._monaco.languages.CompletionItemKind.Interface, undefined];
                case services_1.CompletionItemKind.Module: return [this._monaco.languages.CompletionItemKind.Module, undefined];
                case services_1.CompletionItemKind.Property: return [this._monaco.languages.CompletionItemKind.Property, undefined];
                case services_1.CompletionItemKind.Unit: return [this._monaco.languages.CompletionItemKind.Unit, undefined];
                case services_1.CompletionItemKind.Value: return [this._monaco.languages.CompletionItemKind.Value, undefined];
                case services_1.CompletionItemKind.Enum: return [this._monaco.languages.CompletionItemKind.Enum, undefined];
                case services_1.CompletionItemKind.Keyword: return [this._monaco.languages.CompletionItemKind.Keyword, undefined];
                case services_1.CompletionItemKind.Snippet: return [this._monaco.languages.CompletionItemKind.Snippet, undefined];
                case services_1.CompletionItemKind.Color: return [this._monaco.languages.CompletionItemKind.Color, undefined];
                case services_1.CompletionItemKind.File: return [this._monaco.languages.CompletionItemKind.File, undefined];
                case services_1.CompletionItemKind.Reference: return [this._monaco.languages.CompletionItemKind.Reference, undefined];
                case services_1.CompletionItemKind.Folder: return [this._monaco.languages.CompletionItemKind.Folder, undefined];
                case services_1.CompletionItemKind.EnumMember: return [this._monaco.languages.CompletionItemKind.EnumMember, undefined];
                case services_1.CompletionItemKind.Constant: return [this._monaco.languages.CompletionItemKind.Constant, undefined];
                case services_1.CompletionItemKind.Struct: return [this._monaco.languages.CompletionItemKind.Struct, undefined];
                case services_1.CompletionItemKind.Event: return [this._monaco.languages.CompletionItemKind.Event, undefined];
                case services_1.CompletionItemKind.Operator: return [this._monaco.languages.CompletionItemKind.Operator, undefined];
                case services_1.CompletionItemKind.TypeParameter: return [this._monaco.languages.CompletionItemKind.TypeParameter, undefined];
                default: return [value - 1, undefined];
            }
        }
        ;
        return [services_1.CompletionItemKind.Text, value];
    }
    asCompletionInsertText(item, defaultRange) {
        const isSnippet = item.insertTextFormat === services_1.InsertTextFormat.Snippet;
        if (item.textEdit) {
            if (services_1.TextEdit.is(item.textEdit)) {
                const range = this.asRange(item.textEdit.range);
                const value = item.textEdit.newText;
                return { isSnippet, insertText: value, range, fromEdit: true, };
            }
            else {
                const range = {
                    insert: this.asRange(item.textEdit.insert),
                    replace: this.asRange(item.textEdit.replace)
                };
                const value = item.textEdit.newText;
                return { isSnippet, insertText: value, range, fromEdit: true, };
            }
        }
        if (item.insertText) {
            return { isSnippet, insertText: item.insertText, fromEdit: false, range: defaultRange };
        }
        return { insertText: item.label, range: defaultRange, fromEdit: false, isSnippet: false };
    }
    asDocumentLinks(documentLinks) {
        const links = documentLinks.map(link => this.asDocumentLink(link));
        return { links };
    }
    asDocumentLink(documentLink) {
        return {
            range: this.asRange(documentLink.range),
            url: documentLink.target,
            data: documentLink.data,
            tooltip: documentLink.tooltip
        };
    }
    asRange(range) {
        if (range === undefined) {
            return undefined;
        }
        if (range === null) {
            return null;
        }
        const start = this.asPosition(range.start);
        const end = this.asPosition(range.end);
        if (start instanceof this._monaco.Position && end instanceof this._monaco.Position) {
            return new this._monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
        }
        const startLineNumber = !start || start.lineNumber === undefined ? undefined : start.lineNumber;
        const startColumn = !start || start.column === undefined ? undefined : start.column;
        const endLineNumber = !end || end.lineNumber === undefined ? undefined : end.lineNumber;
        const endColumn = !end || end.column === undefined ? undefined : end.column;
        return { startLineNumber, startColumn, endLineNumber, endColumn };
    }
    asPosition(position) {
        if (position === undefined) {
            return undefined;
        }
        if (position === null) {
            return null;
        }
        const { line, character } = position;
        const lineNumber = line === undefined ? undefined : line + 1;
        const column = character === undefined ? undefined : character + 1;
        if (lineNumber !== undefined && column !== undefined) {
            return new this._monaco.Position(lineNumber, column);
        }
        return { lineNumber, column };
    }
    asColorInformations(items) {
        return items.map(item => this.asColorInformation(item));
    }
    asColorInformation(item) {
        return {
            range: this.asRange(item.range),
            color: item.color
        };
    }
    asColorPresentations(items) {
        return items.map(item => this.asColorPresentation(item));
    }
    asColorPresentation(item) {
        return {
            label: item.label,
            textEdit: this.asTextEdit(item.textEdit),
            additionalTextEdits: this.asTextEdits(item.additionalTextEdits)
        };
    }
    asFoldingRanges(items) {
        if (!items) {
            return items;
        }
        return items.map(item => this.asFoldingRange(item));
    }
    asFoldingRange(item) {
        return {
            start: item.startLine + 1,
            end: item.endLine + 1,
            kind: this.asFoldingRangeKind(item.kind)
        };
    }
    asFoldingRangeKind(kind) {
        if (kind) {
            switch (kind) {
                case services_1.FoldingRangeKind.Comment:
                    return this._monaco.languages.FoldingRangeKind.Comment;
                case services_1.FoldingRangeKind.Imports:
                    return this._monaco.languages.FoldingRangeKind.Imports;
                case services_1.FoldingRangeKind.Region:
                    return this._monaco.languages.FoldingRangeKind.Region;
            }
            ;
        }
        return undefined;
    }
    asSemanticTokens(semanticTokens) {
        return {
            resultId: semanticTokens.resultId,
            data: Uint32Array.from(semanticTokens.data)
        };
    }
}
exports.ProtocolToMonacoConverter = ProtocolToMonacoConverter;
//# sourceMappingURL=monaco-converter.js.map