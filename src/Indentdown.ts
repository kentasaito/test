// void要素とインライン要素
type NodeType = null | "text" | "html" | "child";
type Node = {
  nodeType: NodeType;
  value: string;
  children: Node[];
};
type NumTags = {
  open: number;
  close: number;
};

export class Indentdown {
  static nodeType: NodeType = null;
  static htmlDepth: number = 0;

  static #getNumTags(line: string): NumTags {
    const value = line.replace(/[^<\/>]/g, "");
    return {
      open: value.split("<>").length - 1,
      close: value.split("</>").length - 1,
    };
  }

  static #updateNodeType(line: string, lastNodeType: NodeType) {
    const numTags = this.#getNumTags(line);
    this.htmlDepth += numTags.open - numTags.close;
    if (line.match(/^ *$/)) {
      if (lastNodeType === "text") {
        this.nodeType = null;
      }
    } else if (this.nodeType !== "html" && line.match(/^ {2}/)) {
      this.nodeType = "child";
    } else if (this.nodeType !== "child" && this.htmlDepth > 0 || numTags.open > 0 || numTags.close > 0) {
      this.nodeType = "html";
    } else {
      this.nodeType = "text";
    }
  }

  static #flushNodeIfNodeTypeChanged(
    tree: Node[],
    buffer: string[],
    lastNodeType: NodeType,
  ) {
    if (this.nodeType !== lastNodeType) {
      console.log({ nodeType: this.nodeType });
      if (lastNodeType !== null) {
        if (buffer.length > 0) {
          tree.push(
            lastNodeType === "child"
              ? {
                nodeType: lastNodeType,
                value: "",
                children: this.#getTreeRecursive(
                  buffer.map((line) => line.replace(/^ {2}/, "")),
                ),
              }
              : {
                nodeType: lastNodeType,
                value: buffer.join("\n").trim(),
                children: [],
              } as Node,
          );
        }
      }
      buffer.length = 0;
    }
  }

  static #getTreeRecursive(lines: string[]): Node[] {
    const tree = [] as Node[];
    const buffer = [];
    for (const line of lines) {
      console.log({ line });
      const lastNodeType = this.nodeType;
      this.#updateNodeType(line, lastNodeType);
      this.#flushNodeIfNodeTypeChanged(tree, buffer, lastNodeType);
      buffer.push(line);
      console.log();
    }
    const lastNodeType = this.nodeType;
    this.nodeType = null;
    this.#flushNodeIfNodeTypeChanged(tree, buffer, lastNodeType);
    return tree;
  }

  static getTree(input: string): Node[] {
    return this.#getTreeRecursive(input.split("\n"));
  }

  static #getHtmlRecursive(tree: Node[], nodeDepth: number = 0): string[] {
    const lines: string[] = [];
    for (const key in tree) {
      const i = parseInt(key);
      const node = tree[i];
      if (node.nodeType === "child") {
        lines.push("<div>");
        lines.push(...this.#getHtmlRecursive(node.children, nodeDepth + 1).map((line) => "  " + line));
        lines.push("</div>");
      } else if (node.nodeType === "html") {
        lines.push(...node.value.split("\n"));
      } else if (i < tree.length - 1 && tree[i + 1].nodeType === "child") {
        lines.push(`<h${nodeDepth + 1}>${node.value}</h${nodeDepth + 1}>`);
      } else {
        lines.push("<p>");
        lines.push(...node.value.split("\n").map((line) => "  " + line + "<br>"));
        lines.push("</p>");
      }
    }
    return lines;
  }

  static getHtml(tree: Node[]): string {
    const lines = this.#getHtmlRecursive(tree);
    let unindent: number = 0;
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
  console.log(tree);
  const html = Indentdown.getHtml(tree);
  console.log(html);
}
