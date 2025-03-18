import { serveDir } from "jsr:@std/http@1";

Deno.serve(request => {
  return serveDir(request, { fsRoot: "./static", urlRoot: ""});
});
