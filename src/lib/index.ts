declare var require: any; // declared by rollup intro

//@ts-ignore
import { Logger } from "svelte-language-server/dist/src/logger";
Logger.setLogErrorsOnly(!(window as any)._sv_verbose);


const required: Record<string, any> = {};
const resolved_to_package: Record<string, any> = {
  
};
require = function (req: string) {
  console.debug(`requiring ${req}`);
  if (req in required) {
    return required[req];
  }
  throw new Error("Cannot find module '" + req + "'")
};

require.resolve = function(req:string){
  if(resolved_to_package[req])return resolved_to_package[req];
  return req
}


// converted to a global __typescript after bundling
// import ts from "typescript";

import preprocess from "svelte-preprocess";
import {version as preprocess_version} from "svelte-preprocess/package.json";
required["/svelte-preprocess"] = preprocess;
required["svelte-preprocess/package.json"] = {version: preprocess_version};


import {version as svelte_version} from "svelte-preprocess/package.json";
import * as svelte_compiler from 'svelte/compiler'
required["svelte/package.json"] = {version: svelte_version};
required["/svelte/compiler"] = svelte_compiler;

import * as ts_transformer from 'svelte-preprocess/dist/transformers/typescript'
required["./transformers/typescript"] = ts_transformer;



//@ts-ignore
import prettier_plugin_svelte from "prettier-plugin-svelte";
import {version as pps_version} from "prettier-plugin-svelte/package.json";
required["/prettier-plugin-svelte"] = prettier_plugin_svelte;
required["prettier-plugin-svelte/package.json"] = {version: pps_version};
resolved_to_package["prettier-plugin-svelte"] = prettier_plugin_svelte;



import prettier from "prettier";
import {version as prettier_version} from "prettier/package.json";

//@ts-ignore
prettier.resolveConfig = async(filePath: string, options?: prettier.ResolveConfigOptions | undefined)=>null;
prettier.resolveConfig.sync =(filePath: string, options?: prettier.ResolveConfigOptions | undefined)=>null;
//@ts-ignore
prettier.getFileInfo = async(filePath: string, options?: prettier.FileInfoOptions | undefined)=>(<prettier.FileInfoResult>{ignored:false, inferredParser:'svelte'})
prettier.getFileInfo.sync = (filePath: string, options?: prettier.FileInfoOptions | undefined)=>(<prettier.FileInfoResult>{ignored:false, inferredParser:'svelte'})
required["/prettier"] = prettier;
required["prettier/package.json"] = {version: prettier_version};
const _pformat = prettier.format;

//@ts-ignore
import prettier_ts from 'prettier_ts'
import prettier_css from "prettier/parser-postcss";
// import prettier_ts from "prettier/parser-typescript";
import prettier_html from "prettier/parser-html";
prettier.format = (source:string, options?:prettier.Options)=>_pformat(source, {...(options ||{}), plugins:[
  prettier_plugin_svelte,
  prettier_css,
  prettier_ts,
  prettier_html
]} )


import sm from 'source-map';
//@ts-ignore
// import mappings_wasm from 'source-map/lib/mappings.wasm';
//@ts-ignore
sm.SourceMapConsumer.initialize({//TODO:bundle this?
  "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
});


import path from 'path';
import pathParse from 'path-parse';
path.parse = pathParse;




// export * from "svelte-language-server/dist/src/plugins";
// export * from "svelte-language-server/dist/src/plugins/typescript/LSAndTSDocResolver";
// export * from "svelte-language-server/dist/src/lib/documents";
// export * from "svelte-language-server/dist/src/ls-config";

import {Init as InitMonaco} from './monaco_setup'

export default InitMonaco;
