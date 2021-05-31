
# Monaco Svelte Language Server

## WIP

[![Netlify Status](https://api.netlify.com/api/v1/badges/5c091b58-5cfa-483b-b2a6-ee57a161332b/deploy-status)](https://app.netlify.com/sites/elegant-rosalind-57500c/deploys)

This is a port of the VSCode language tools of [Svelte frontend framework](https://svelte.dev/) to the browser based [Monaco editor](https://github.com/microsoft/monaco-editor) (no server - everything is run on the client side)

## [Demo here](https://elegant-rosalind-57500c.netlify.app)

### Features currently implemented:
* Auto-completion
* Auto-formatting
* Diagnostics - typescript errors, etc...
* Basic Monarch based syntax highlighting (typescript, html, no moustache currently)
* Hover, signature, semantic tokens, doc symbols providers


### TODO:
* Move processing to a worker
* Make bundle smaller
* Make other preprocessor easier to include in a custom build?
* Add moustache syntax highlighting {#if}, {#each}...
* A decent theme
* **open an issue and tell me**


Notable packages used by this code:
* [TypeFox/monaco-languageclient](https://github.com/TypeFox/monaco-languageclient) - used for VSCode-Monaco protocol conversion

* [@typescript/vfs](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/typescript-vfs) used for a virtual Typescript filesystem

* [snowpackjs/rollup-plugin-polyfill-node](https://github.com/snowpackjs/rollup-plugin-polyfill-node) Node polyfills

* [microsoft/monaco-editor](https://github.com/microsoft/monaco-editor) Monaco editor which is built from [VSCode](https://github.com/microsoft/vscode/)

