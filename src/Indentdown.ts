// ノードクラス
class IndentdownNode {
  isHtmlBlock: boolean;
  value: string;
  children: IndentdownNode[];

  constructor(
    isHtmlBlock: boolean = false,
    value: string = "",
    children: IndentdownNode[] = [],
  ) {
    this.isHtmlBlock = isHtmlBlock;
    this.value = value;
    this.children = children;
  }
}

/** Indentdown class */
export class Indentdown {
  // インデント
  static #indent = "  ";

  // "#<"を"&lt;"に、"#>"を"&gt;"に変換
  static #escapeTags(input: string) {
    return input.replace(/#</g, "&lt;").replace(/#>/g, "&gt;");
  }

  // インデントの深さを得る
  static #getIndentDepth(line: string) {
    return (line.match(new RegExp(`^((?:${this.#indent})*)`))?.[1].length ??
      0) / this.#indent.length;
  }

  // HTMLブロックであるか
  static #isHtmlBlock(line: string) {
    return line.match(
        /^ *<(address|article|aside|blockquote|canvas|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hr|li|main|nav|noscript|ol|p|pre|section|table|tfoot|ul|video|textarea)/,
      )
      ? true
      : false;
  }

  // 閉じたHTMLであるか
  static #isClosedHtml(value: string) {
    value = value.replace(
      /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)[^>]*>/g,
      "",
    );
    value = value.replace(/[^<\/>]/g, "");
    return value.split(/<>/).length - value.split(/<\/>/).length === 0;
  }

  // 行の配列から木構造を得る
  static #getTreeFromLines(lines: string[], indentDepth: number = 0) {
    // 行がなければ空の木構造を返す
    if (lines.length === 0) {
      return new IndentdownNode();
    }
    // 行の配列の先頭行をシフトで得る
    const line = lines.shift() ?? "";
    // ノードタイプを決定し、木構造を作る
    const tree = new IndentdownNode(this.#isHtmlBlock(line));
    // 木構造の値はインデントの深さだけアンインデントした行
    tree.value = line.replace(
      new RegExp(`(?:${this.#indent}){${indentDepth}}`),
      "",
    );
    // 条件を満たす間
    while (
      lines.length > 0 &&
      (
        !tree.isHtmlBlock
          ? this.#getIndentDepth(lines[0]) == indentDepth &&
            !this.#isHtmlBlock(lines[0])
          : !this.#isClosedHtml(tree.value)
      )
    ) {
      // 続きの行を追加
      const continuation = lines.shift() ?? "";
      if (continuation !== "") {
        tree.value += "\n" +
          continuation.replace(
            new RegExp(`(?:${this.#indent}){${indentDepth}}`),
            "",
          );
      }
    }
    // 空行を飛ばす
    while (lines[0] === "") {
      lines.shift();
    }
    while (lines.length > 0 && this.#getIndentDepth(lines[0]) > indentDepth) {
      const child = this.#getTreeFromLines(lines, indentDepth + 1);
      if (child !== undefined) {
        tree.children.push(child);
      }
    }
    // 木構造を返す
    return tree;
  }

  // テキストから木構造を得る
  static #getTree(input: string) {
    return this.#getTreeFromLines([
      "ROOT",
      ...input.trim().split("\n").map((line) =>
        `${this.#indent}${line}`.replace(new RegExp(`^${this.#indent}$`), "")
      ),
    ]);
  }

  // 木構造からHTMLを得る
  static #getHtmlFromTree(tree: IndentdownNode, indentDepth: number = 0) {
    let html = "";
    if (!tree.isHtmlBlock) {
      if (tree.children.length > 0) {
        html += `<h${indentDepth}>${tree.value}</h${indentDepth}>`;
      } else {
        html += `<p>\n${
          tree.value.split("\n").map((line) => `${this.#indent}${line}<br>`)
            .join("\n")
        }\n</p>`;
      }
    } else {
      html += tree.value;
    }
    if (tree.children.length > 0) {
      html += "\n<div>";
      html += "\n" +
        tree.children.map((node) =>
          this.#getHtmlFromTree(node, indentDepth + 1).split("\n").map((line) =>
            `${this.#indent}${line}`
          ).join("\n")
        ).join("\n");
      html += "\n</div>";
    }
    return html;
  }

  // HTMLから根ノードを削除する
  static #deleteRootNodeFromHtml(html: string) {
    const lines = html.split("\n");
    lines.shift();
    lines.shift();
    lines.pop();
    return lines.map((line) => line.replace(new RegExp(`^${this.#indent}`), ""))
      .join("\n");
  }

  // <textarea>をアンインデントする
  static #unindentTextarea(html: string) {
    let depth = 0;
    return html.split("\n").map((line) => {
      if (line.match(new RegExp(`^(?:${this.#indent})*</textarea>$`))) {
        line = line.replace(new RegExp(`^(${this.#indent}){${depth}}`), "");
        depth = 0;
      }
      if (depth > 0) {
        line = line.replace(new RegExp(`^(${this.#indent}){${depth + 1}}`), "");
      }
      const matches = line.match(
        new RegExp(`^((?:${this.#indent})*)<textarea`),
      );
      if (matches) {
        depth = matches[1].length / this.#indent.length;
        line = line.replace(new RegExp(`^(${this.#indent}){${depth}}`), "");
      }
      return line;
    }).join("\n");
  }

  // <pre>をアンインデントする
  static #unindentPre(html: string) {
    let depth = 0;
    return html.split("\n").map((line) => {
      if (line.match(new RegExp(`^(?:${this.#indent})*</pre>$`))) {
        line = line.replace(new RegExp(`^(${this.#indent}){${depth}}`), "");
        depth = 0;
      }
      if (depth > 0) {
        line = line.replace(new RegExp(`^(${this.#indent}){${depth + 1}}`), "");
      }
      const matches = line.match(new RegExp(`^((?:${this.#indent})*)<pre`));
      if (matches) {
        depth = matches[1].length / this.#indent.length;
        line = line.replace(new RegExp(`^(${this.#indent}){${depth}}`), "");
      }
      return line;
    }).join("\n");
  }

  /** Get HTML from text */
  static getHtml(input: string): string {
    return this.#unindentPre(
      this.#unindentTextarea(
        this.#deleteRootNodeFromHtml(
          this.#getHtmlFromTree(
            this.#getTree(
              this.#escapeTags(input),
            ),
          ),
        ),
      ),
    );
  }
}
