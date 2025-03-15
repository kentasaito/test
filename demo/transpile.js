import * as esbuild from "npm:esbuild@0.20.2";

const result = await esbuild.build({
  entryPoints: ["../src/Indentdown.ts"],
  outfile: "./Indentdown.js",
});

console.log(result.outputFiles);

esbuild.stop();
