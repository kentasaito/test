import { Hono } from "jsr:@hono/hono@^4.7.5";
import { serveStatic } from "jsr:@hono/hono@^4.7.5/deno";
import { Indentdown } from "./src/Indentdown.ts";
import { layout } from "./site/layout.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.redirect("/index.html");
});
app.get("/:htmlName{(index|demo|syntax|download)\\.html}", (c) => {
  return c.html(
    layout(
      Indentdown.getHtml(
        Deno.readTextFileSync(
          `./site/id/${c.req.param("htmlName").replace(/\.html$/, ".id")}`,
        ),
      ),
    ),
  );
});

app.get("/*", serveStatic({ root: "./" }));

Deno.serve(app.fetch);
