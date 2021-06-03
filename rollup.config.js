import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
// import { terser } from 'rollup-plugin-terser';
import nodePolyfills from "rollup-plugin-polyfill-node/dist/index";
import virtual from '@rollup/plugin-virtual';
import alias from "@rollup/plugin-alias";
import analyze from "rollup-plugin-analyzer";

import * as fs from "fs";

const compiled_vfs = fs.readFileSync("./build/ts-out/src/vfs/vfs.js");

const intro = fs.readFileSync("./src/bundled/intro.js");
const banner = fs
  .readFileSync("./src/bundled/banner.js")
  .toString()
  .replace("$$COMPILED_VFS$$", compiled_vfs);

export default {
  input: "build/ts-out/src/lib/index.js",
  plugins: [
    virtual({
      glob: `export default {sync:(a,b)=>[]}`, // used by svelte config loader - fallbacks to defaults 
    }),

    alias({
      entries: [
        { find: "lodash", replacement: "lodash-es" },
        { find: "monaco-editor-core", replacement: "monaco-editor" },
        { find: /vscode.html.languageservice.lib.umd.*webCustomData/, 
          replacement: "vscode-html-languageservice/lib/esm/languageFacts/data/webCustomData" },
      ],
    }),
    {
      resolveId(source,importer){
        if(source.includes('svelte/compiler') ){ // otherwise it's included twice
          return this.resolve(source, importer, { skipSelf: true , custom: { 'node-resolve': { isRequire: true }}});
        }
      }
    },
    resolve({
      browser: true,
      preferBuiltins: false,
      moduleDirectories: ["node_modules", "vendor"],
    }),
    commonjs({
      ignoreDynamicRequires: true,
      sourceMap: false,
    }),
    nodePolyfills(),
    json(),
    replace({
      values: {
        "import { TextDecoder } from 'util';": "", // not in nodePolyfills but TextDecoder should be in browser globals
      },
      delimiters: ["", ""],
      preventAssignment: true,
    }),
    // terser(),
    analyze({ 
      // summaryOnly: true,
       limit: 20 
    }),
  ],

  external: [
    "typescript", // these 4 are big and loaded from cdn
    "monaco-editor",
    "@typescript/vfs",
    "prettier_ts",

    "fs", // mocked

    "chokidar", // used by svelte config loader

    "sugarss",
    "pug",
    "less",
    "stylus",
    "postcss-load-config",
    "coffeescript",
  ],
  //
  output: [
    {
      sourcemap: false,
      file: "build/bundles/monaco-svelte.mjs",
      format: "amd", // this makes it easy to mock "fs" and undefine many other modules
      intro,
      banner,
    },
  ],
};
