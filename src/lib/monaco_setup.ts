// import _monaco from 'monaco-editor'
import type * as _monaco from "monaco-editor";
import { SvelteDocument } from "svelte-language-server/dist/src/plugins/svelte/SvelteDocument";
import {
  Document,
  DocumentManager,
} from "svelte-language-server/dist/src/lib/documents";
import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
} from "monaco-languageclient/client/lib/monaco-converter";
import { LSConfigManager } from "svelte-language-server/dist/src/ls-config";
import { getSemanticTokenLegends } from "svelte-language-server/dist/src/lib/semanticToken/semanticTokenLegend";
import {
  SveltePlugin,
  HTMLPlugin,
  CSSPlugin,
  TypeScriptPlugin,
  PluginHost,
  LSAndTSDocResolver,
} from "svelte-language-server/dist/src/plugins";
// import { TextDocumentIdentifier } from 'monaco-languageclient';
import * as htmllang from "./syntax";


import { debounce } from "lodash";

export { MonacoToProtocolConverter, ProtocolToMonacoConverter };

//create the Monaco editor

const TEST_SVELTE = `
<script lang="ts">
  export let kiki = 30;
  function hola(mundo: string) {
    console.log(mundo);
  }
  hola(5); //type error
</script>

<div>
  {#if kiki > 10}
    {kiki - 10}
  {/if}
</div>

<style>
  div {
    color: blue;
  }
</style>`;

declare const monaco: typeof _monaco;

export async function Init(element: HTMLElement) {
  const LANGUAGE_ID = "svelte";
  const MODEL_URI = "file://fs/test.svelte";
  const MONACO_URI = monaco.Uri.parse(MODEL_URI);

  monaco.languages.register({
    id: LANGUAGE_ID,
    extensions: [".svelte"],
    aliases: ["Svelte", "svelte"],
    mimetypes: ["application/svelte"],
  });

  monaco.languages.setLanguageConfiguration(
    LANGUAGE_ID,
    htmllang.conf as _monaco.languages.LanguageConfiguration
  );

  // monaco.editor.defineTheme("myCoolTheme", {
  //   base: "vs",
  //   inherit: true,
  //   rules: [
  //     // { token: 'custom-info', foreground: '808080' },
  //     // { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
  //     // { token: 'custom-notice', foreground: 'FFA500' },
  //     // { token: 'custom-date', foreground: '008800' },
  //   ],
  // });

  let doDiagnostics = () => { };
  const editor = monaco.editor.create(element, {
    model: monaco.editor.createModel(TEST_SVELTE, LANGUAGE_ID, MONACO_URI),
    "semanticHighlighting.enabled": true,
    theme: "myCoolTheme",
    glyphMargin: true,
    lightbulb: {
      enabled: true,
    },
  });
  setTimeout(() => doDiagnostics(), 1);




  // Register a tokens provider for the language

  monaco.languages.setMonarchTokensProvider(
    LANGUAGE_ID,
    htmllang.language as _monaco.languages.IMonarchLanguage
  );

  const { tokenTypes } = getSemanticTokenLegends();
  const t = (editor as any)._themeService._theme;
  t.getTokenStyleMetadata = (type: any, modifiers: any) => {
    //   console.log('getTokenStyleMetadata',type,modifiers)
    return {
      foreground: 3 + tokenTypes.indexOf(type), // color id 5
      bold: false,
      underline: false,
      italic: true,
    };
  };

  const m2p = new MonacoToProtocolConverter(monaco as any);
  const p2m = new ProtocolToMonacoConverter(monaco as any);

  const docManager = new DocumentManager((textDocument) => {
    // debugger
    return new Document(textDocument.uri, textDocument.text);
  });

  const configManager = new LSConfigManager();
  const pluginHost = new PluginHost(docManager);

  pluginHost.initialize({
    filterIncompleteCompletions: true,

    // !evt.initializationOptions?.dontFilterIncompleteCompletions,
    definitionLinkSupport: true, //!!evt.capabilities.textDocument?.definition?.linkSupport
  });

  const workspaceUris = ["file://fs/"];
  let sveltePlugin = new SveltePlugin(configManager);
  pluginHost.register(sveltePlugin);
  pluginHost.register(new HTMLPlugin(docManager, configManager));
  pluginHost.register(new CSSPlugin(docManager, configManager));
  pluginHost.register(
    new TypeScriptPlugin(configManager, new LSAndTSDocResolver(docManager, workspaceUris, configManager))
  );

  monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
    async provideCompletionItems(model, position, context, token) {
      // monaco.Thenable<monaco.languages.CompletionList>
      docManager.openDocument({
        text: model.getValue(),
        uri: model.uri.toString(),
      });
      // const document = createDocument(model);
      const wordUntil = model.getWordUntilPosition(position);
      const defaultRange = new monaco.Range(
        position.lineNumber,
        wordUntil.startColumn,
        position.lineNumber,
        wordUntil.endColumn
      );
      // const jsonDocument = jsonService.parseJSONDocument(document);
      return pluginHost
        .getCompletions(
          { uri: model.uri.toString() },
          m2p.asPosition(position.lineNumber, position.column),
          m2p.asCompletionContext(context)
        )
        .then((list) => {
          return p2m.asCompletionResult(list, defaultRange);
        });
    },

    async resolveCompletionItem(item, token) {
      //monaco.languages.CompletionItem | monaco.Thenable<monaco.languages.CompletionItem>
      const model = editor.getModel();
      return pluginHost
        .resolveCompletion(
          { uri: model?.uri?.toString() ?? "" },
          m2p.asCompletionItem(item),
          token
        )
        .then((result) => p2m.asCompletionItem(result, item.range));
    },
  });

  monaco.languages.registerDocumentRangeFormattingEditProvider(LANGUAGE_ID, {
    async provideDocumentRangeFormattingEdits(model, range, options, token) {
      //: monaco.languages.TextEdit[] | monaco.Thenable<monaco.languages.TextEdit[]>
      docManager.openDocument({
        text: model.getValue(),
        uri: model.uri.toString(),
      });
      // const document = createDocument(model);
      // const edits = jsonService.format(document, m2p.asRange(range), m2p.asFormattingOptions(options));
      const edits = await pluginHost.formatDocument(
        { uri: model.uri.toString() },
        { ...options }
      );
      return p2m.asTextEdits(edits);
    },
  });

  monaco.languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
    async provideDocumentSymbols(model, token) {
      //monaco.languages.DocumentSymbol[] | monaco.Thenable<monaco.languages.DocumentSymbol[]>
      // const document = createDocument(model);
      // const jsonDocument = jsonService.parseJSONDocument(document);
      // return p2m.asSymbolInformations(jsonService.findDocumentSymbols(document, jsonDocument));
      docManager.openDocument({
        text: model.getValue(),
        uri: model.uri.toString(),
      });
      const symobls = await pluginHost.getDocumentSymbols({
        uri: model.uri.toString(),

      }, token);
      return p2m.asSymbolInformations(symobls);
    },
  });

  monaco.languages.registerHoverProvider(LANGUAGE_ID, {
    provideHover(model, position, token) {
      docManager.openDocument({
        text: model.getValue(),
        uri: model.uri.toString(),
      });
      return pluginHost
        .doHover(
          { uri: model.uri.toString() },
          m2p.asPosition(position.lineNumber, position.column)
        )
        .then((res) => p2m.asHover(res));
    },
  });

  monaco.languages.registerSignatureHelpProvider(LANGUAGE_ID, {
    signatureHelpTriggerCharacters: ["(", ",", "<"],
    signatureHelpRetriggerCharacters: [")"],
    async provideSignatureHelp(model, position, token:_monaco.CancellationToken, context) {
      docManager.openDocument({
        text: model.getValue(),
        uri: model.uri.toString(),
      });
      const help = await pluginHost.getSignatureHelp(
        { uri: model.uri.toString() },
        m2p.asPosition(position.lineNumber, position.column),
        m2p.asSignatureHelpContext(context),
        token
      );
      return p2m.asSignatureHelpResult(help);
    },
  });

  monaco.languages.registerDocumentSemanticTokensProvider(LANGUAGE_ID, {
    getLegend: getSemanticTokenLegends,

    provideDocumentSemanticTokens: async (model, lastResultId, token) => {
      // console.log('ddd',model)
      docManager.openDocument({
        text: model.getValue(),
        uri: model.uri.toString(),
      });
      const st = await pluginHost.getSemanticTokens({
        uri: model.uri.toString(),
      });
      if (!st) return null;
      return p2m.asSemanticTokens(st);
    },

    releaseDocumentSemanticTokens: () => { },
  });

  doDiagnostics = debounce(async () => {
    const model = editor.getModel();
    if (!model) return;
    docManager.openDocument({
      text: model.getValue(),
      uri: model.uri.toString(),
    });
    const diagnostics = await pluginHost.getDiagnostics({
      uri: model.uri.toString(),
    });
    const markers = p2m.asDiagnostics(diagnostics);
    monaco.editor.setModelMarkers(model, "default", markers);
  }, 500);

  //  const debounced = undefined;
  editor.onDidChangeModelContent(async (event) => {
    return doDiagnostics();
  });

  // getModel().onDidChangeContent((event) => {
  //     validate();
  // });

  // function validate(){
  //     const document = createDocument(getModel());
  //     cleanPendingValidation(document);
  //     pendingValidationRequests.set(document.uri, setTimeout(() => {
  //         pendingValidationRequests.delete(document.uri);
  //         doValidate(document);
  //     }));
  // }

  // function cleanPendingValidation(document/*: TextDocument*/) {
  //     const request = pendingValidationRequests.get(document.uri);
  //     if (request !== undefined) {
  //         clearTimeout(request);
  //         pendingValidationRequests.delete(document.uri);
  //     }
  // }

  // function doValidate(document /*: TextDocument*/) {
  //     if (document.getText().length === 0) {
  //         cleanDiagnostics();
  //         return;
  //     }
  //     // const jsonDocument = jsonService.parseJSONDocument(document);
  //     jsonService.doValidation(document, jsonDocument).then((diagnostics) => {
  //         const markers = p2m.asDiagnostics(diagnostics);
  //         monaco.editor.setModelMarkers(getModel(), 'default', markers);
  //     });
  // }

  // function cleanDiagnostics() {
  //     monaco.editor.setModelMarkers(getModel(), 'default', []);
  // }
}
