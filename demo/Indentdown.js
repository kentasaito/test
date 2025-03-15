const voidElements = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
const voidElementRegExp = new RegExp(`<(${voidElements.join("|")})[^>]*>`, "g");
const inlineElements = [
  "a",
  "abbr",
  "acronym",
  "b",
  "bdo",
  "big",
  "button",
  "cite",
  "code",
  "dfn",
  "em",
  "i",
  "kbd",
  "label",
  "map",
  "object",
  "output",
  "q",
  "samp",
  "script",
  "select",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "textarea",
  "time",
  "tt",
  "var"
];
const inlineElementOpenRegExp = new RegExp(
  `<(${inlineElements.join("|")})[^>]*>`,
  "g"
);
const inlineElementCloseRegExp = new RegExp(
  `</(${inlineElements.join("|")})>`,
  "g"
);
export class Indentdown {
  static #getNumTags(line) {
    const value = line.replace(voidElementRegExp, "").replace(inlineElementOpenRegExp, "").replace(inlineElementCloseRegExp, "").replace(/[^<\/>]/g, "");
    return {
      open: value.split("<>").length - 1,
      close: value.split("</>").length - 1
    };
  }
  static #flushNodeIfNodeTypeChanged(tree, buffer, lastNodeType, nodeType) {
    if (nodeType !== lastNodeType) {
      if (lastNodeType !== null) {
        if (buffer.length > 0) {
          tree.push(
            lastNodeType === "parent" ? {
              nodeType: lastNodeType,
              value: "",
              children: this.#getTreeRecursive(
                buffer.map((line) => line.replace(/^ {2}/, ""))
              )
            } : {
              nodeType: lastNodeType,
              value: buffer.join("\n").trim(),
              children: []
            }
          );
        }
      }
      buffer.length = 0;
    }
  }
  static #getTreeRecursive(lines) {
    const tree = [];
    const buffer = [];
    let htmlDepth = 0;
    let nodeType = null;
    for (const line of lines) {
      const lastNodeType2 = nodeType;
      const numTags = this.#getNumTags(line);
      htmlDepth += numTags.open - numTags.close;
      if (line.match(/^ *$/)) {
        if (lastNodeType2 === "text") {
          nodeType = null;
        }
      } else if (nodeType !== "html" && line.match(/^ {2}/)) {
        nodeType = "parent";
      } else if (nodeType !== "parent" && htmlDepth > 0 || numTags.open > 0 || numTags.close > 0) {
        nodeType = "html";
      } else {
        nodeType = "text";
      }
      this.#flushNodeIfNodeTypeChanged(tree, buffer, lastNodeType2, nodeType);
      buffer.push(line);
    }
    const lastNodeType = nodeType;
    nodeType = null;
    this.#flushNodeIfNodeTypeChanged(tree, buffer, lastNodeType, nodeType);
    return tree;
  }
  static getTree(input) {
    return this.#getTreeRecursive(input.split("\n"));
  }
  static #getHtmlRecursive(tree, nodeDepth = 0) {
    const lines = [];
    for (const key in tree) {
      const i = parseInt(key);
      const node = tree[i];
      if (node.nodeType === "parent") {
        lines.push("<div>");
        lines.push(
          ...this.#getHtmlRecursive(node.children, nodeDepth + 1).map(
            (line) => "  " + line
          )
        );
        lines.push("</div>");
      } else if (node.nodeType === "html") {
        lines.push(...node.value.split("\n"));
      } else if (i < tree.length - 1 && tree[i + 1].nodeType === "parent") {
        lines.push(`<h${nodeDepth + 1}>${node.value}</h${nodeDepth + 1}>`);
      } else {
        lines.push("<p>");
        lines.push(
          ...node.value.split("\n").map((line) => "  " + line + "<br>")
        );
        lines.push("</p>");
      }
    }
    return lines;
  }
  static getHtml(tree) {
    const lines = this.#getHtmlRecursive(tree);
    let unindent = 0;
    for (const key in lines) {
      const i = parseInt(key);
      const matches = lines[i].match(/^((?: {2})*)<pre/);
      if (matches) {
        unindent = matches[1].length;
      }
      if (unindent > 0) {
        lines[i] = lines[i].replace(new RegExp(`^ {0,${unindent + 2}}`), "");
      }
      if (lines[i].match(/<\/pre/)) {
        unindent = 0;
      }
    }
    return lines.join("\n");
  }
}
if (import.meta.main) {
  let input = "";
  const decoder = new TextDecoder();
  for await (const chunk of Deno.stdin.readable) {
    input += decoder.decode(chunk);
  }
  const tree = Indentdown.getTree(input);
  console.log(JSON.stringify(tree, null, 2));
  const html = Indentdown.getHtml(tree);
  console.log(html);
}
