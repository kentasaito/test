import * as esbuild from "npm:esbuild@0.20.2";

const result = await esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["../Indentdown.ts"],
  outfile: "./Indentdown.js",
//  bundle: true,
//  format: "esm",
});

console.log(result.outputFiles);

esbuild.stop();