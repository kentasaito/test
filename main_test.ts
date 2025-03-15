import { assertEquals } from "@std/assert";
import { Indentdown } from "./src/Indentdown.ts";

Deno.test(function getTree1() {
  assertEquals(Indentdown.getTree("a"), [
    { nodeType: "text", value: "a" },
  ]);
});

Deno.test(function getTree2() {
  assertEquals(Indentdown.getTree("a\n  b\n    c"), [
    { nodeType: "text", value: "a" },
    {
      nodeType: "child",
      children: [
        { nodeType: "text", value: "b" },
        { nodeType: "child", children: [{ nodeType: "text", value: "c" }] },
      ],
    },
  ]);
});

Deno.test(function getTree3() {
  assertEquals(Indentdown.getTree("<></>\na"), [
    { nodeType: "html", value: "<></>" },
    { nodeType: "text", value: "a" },
  ]);
});
