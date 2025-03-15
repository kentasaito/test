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
    const value = line.replace(/[^<\/>]/, "");
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
    } else if (line.match(/^ {2}/)) {
      this.nodeType = "child";
    } else if (this.htmlDepth > 0 || numTags.open > 0 || numTags.close > 0) {
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

  static #getHtmlRecursive(tree: Node[]): string {
    let html = "";
    for (const node of tree) {
      if (node.nodeType === "child") {
        html += this.#getHtmlRecursive(node.children);
      }
    }
    return html;
  }

  static getHtml(tree: Node[]): string {
    return this.#getHtmlRecursive(tree);
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
  console.log({html});
}
