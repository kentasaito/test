import { assertEquals } from "@std/assert";
import { Indentdown } from "./src/Indentdown.ts";

Deno.test(function getTree1() {
  assertEquals(Indentdown.getTree("a"), [
    { nodeType: "text", value: "a", children: [] },
  ]);
});

Deno.test(function getTree2() {
  assertEquals(Indentdown.getTree("a\n  b\n    c"), [
    { nodeType: "text", value: "a", children: [] },
    {
      nodeType: "child",
      value: "",
      children: [
        { nodeType: "text", value: "b", children: [] },
        { nodeType: "child", value: "", children: [{ nodeType: "text", value: "c", children: [] }] },
      ],
    },
  ]);
});

Deno.test(function getTree3() {
  assertEquals(Indentdown.getTree("<></>\na"), [
    { nodeType: "html", value: "<></>", children: [] },
    { nodeType: "text", value: "a", children: [] },
  ]);
});

Deno.test(function getTree4() {
  assertEquals(Indentdown.getTree("<p></p>\na"), [
    { nodeType: "html", value: "<p></p>", children: [] },
    { nodeType: "text", value: "a", children: [] },
  ]);
});
