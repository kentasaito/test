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
        {
          nodeType: "child",
          value: "",
          children: [{ nodeType: "text", value: "c", children: [] }],
        },
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

Deno.test(function getTree5() {
  assertEquals(Indentdown.getTree("a\n  <pre>\n    b\n  </pre>"), [
    { nodeType: "text", value: "a", children: [] },
    {
      nodeType: "child",
      value: "",
      children: [
        { nodeType: "html", value: "<pre>\n  b\n</pre>", children: [] },
      ],
    },
  ]);
});

Deno.test(function getHtml1() {
  assertEquals(
    Indentdown.getHtml(Indentdown.getTree("a\n  <pre>\n    b\n  </pre>")),
    `<h1>a</h1>
<div>
<pre>
b
</pre>
</div>`,
  );
});

Deno.test(function getTree6() {
  assertEquals(Indentdown.getTree("a\n  b\nc"), [
    { nodeType: "text", value: "a", children: [] },
    {
      nodeType: "child",
      value: "",
      children: [
        { nodeType: "text", value: "b", children: [] },
      ],
    },
    { nodeType: "text", value: "c", children: [] },
  ]);
});
