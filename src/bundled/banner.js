let factory;
let param_names;
function define(_param_names, _factory) {
  factory = _factory;
  param_names = _param_names;
}

import * as vfs from "https://cdn.jsdelivr.net/npm/@typescript/vfs/+esm";
import prettier_ts from "https://cdn.jsdelivr.net/npm/prettier@2.3.0/esm/parser-typescript.mjs";

async function InitMonacoSvelte(element, verbose=true) {
  console.assert(window.ts, "Expected global typescript instance: window.ts");
  console.assert(
    window.monaco,
    "Expected global monaco instance: window.monaco"
  );
  if (verbose) window._sv_verbose = true;

  const vfs_instance = await VFS.create_and_fetch_types({}, ts, vfs);
  const params = {
    typescript: window.ts,
    "monaco-editor": window.monaco,
    "@typescript/vfs": vfs,
    fs: vfs_instance.get_node_fs(),
    prettier_ts,
  };
  vfs_instance.writeFile(
    "tsconfig.json",
    JSON.stringify({
      compilerOptions: {
        lib: ["ES6", "DOM"],
      },
      include: ["/*.d.ts"],
    })
  );
  return factory(...param_names.map((param_name) => params[param_name]))(element);
}
export { InitMonacoSvelte };

$$COMPILED_VFS$$;
