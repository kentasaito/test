import { assertEquals } from "@std/assert";
import { Indentdown } from "../src/Indentdown.ts";

Deno.test(function getHtml() {
  assertEquals(
    Indentdown.getHtml(
      `header
  child
  continuation

  header2
    grandchild
    <pre>
      #<hr#>
      preformatted
        text
    </pre>

  back to depth 1
`,
    ),
    `<h1>header</h1>
<div>
  <p>
    child<br>
    continuation<br>
  </p>
  <h2>header2</h2>
  <div>
    <p>
      grandchild<br>
    </p>
<pre>
&lt;hr&gt;
preformatted
  text
</pre>
  </div>
  <p>
    back to depth 1<br>
  </p>
</div>`,
  );
});
