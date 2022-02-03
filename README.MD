
# Monaco Svelte Language Server

### This was a POC - it is unmaintained. if you want to support latest Svelte Tools in Monaco, you might want to look at https://github.com/asafamr/svelte-vscode-web (Svelte language tools for VSCode Web, communicating using LSP protocol)

This is a port of the VSCode language tools of [Svelte frontend framework](https://svelte.dev/) to the browser based [Monaco editor](https://github.com/microsoft/monaco-editor) (no server - everything runs on the client side)

## [Demo here](https://elegant-rosalind-57500c.netlify.app)

### Features currently implemented:
* Auto-completion
* Auto-formatting
* Diagnostics - typescript errors, etc...
* Basic Monarch based syntax highlighting (typescript, html, no moustache currently)
* Hover, signature, semantic tokens, doc symbols providers


Notable packages used by this code:
* [TypeFox/monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) - used for VSCode-Monaco protocol conversion

* [@typescript/vfs](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/typescript-vfs) used for a virtual Typescript filesystem

* [snowpackjs/rollup-plugin-polyfill-node](https://github.com/snowpackjs/rollup-plugin-polyfill-node) Node polyfills

* [microsoft/monaco-editor](https://github.com/microsoft/monaco-editor) Monaco editor which is built from [VSCode](https://github.com/microsoft/vscode/)

