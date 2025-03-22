import { Indentdown } from "../src/Indentdown.ts";

const decoder = new TextDecoder();
const lines = [];
for await (const chunk of Deno.stdin.readable) {
  lines.push(decoder.decode(chunk));
}
console.log(Indentdown.getHtml(lines.join("\n")));
