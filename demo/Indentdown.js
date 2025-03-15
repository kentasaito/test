export class Indentdown {
  static #parser = new DOMParser();

  // ノードの深さを得る
  static #getNodeDepth(line) {
    return Math.floor(line.replace(/^( *).*?$/, '$1').length / 2);
  }

  // 子要素の数を得る
  static #getChildElementCount(str) {
    return this.#parser.parseFromString(str, 'text/html').body.childElementCount;
  }

  // 閉じた HTML か
  static #isClosedHtml(str) {
    return str.replace(/\s/g, "") === this.#parser.parseFromString(str, 'text/html').body.firstElementChild?.outerHTML.replace(/\s/g, "");
  }

  ////////

  // 子ノードの始まりか
  static #isBeginningOfChildNode(nodeType, line) {
    return nodeType === "current" && this.#getNodeDepth(line) > 0;
  }

  // 子ノードの終わりか
  static #isEndOfChildNode(nodeType, line) {
    return nodeType === "child" && this.#getNodeDepth(line) === 0 && line !== "";
  }

  // HTML ノードの始まりか
  static #isBeginningOfHtmlNode(nodeType, line) {
    return nodeType === "current" && this.#getChildElementCount(line) > 0;
  }

  // HTML ノードの終わりか
  static #isEndOfHtmlNode(nodeType, buffer) {
    return nodeType === "html" && this.#isClosedHtml(buffer.join("\n"));
  }

  ////////

  // バッファをフラッシュする
  static #flushBuffer(buffer) {
    const node = [];
    if (buffer.length) {
      node.push(buffer.join("\n"));
      buffer.length = 0;
    }
    return node;
  }

  ////////

  // 再帰的に木を得る
  static #getTreeRecursive(lines) {
    const tree = [];
    const buffer = [];
    let nodeType = "current";
    // 入力された全ての行に対して
    for (const line of lines) {
      // 子ノードの始まりなら、バッファをフラッシュ、子ノードへ
      if (this.#isBeginningOfChildNode(nodeType, line)) {
        tree.push(...this.#flushBuffer(buffer));
        nodeType = "child";
      }
      // HTML ノードの始まりなら、バッファをフラッシュ、HTML ノードへ
      if (this.#isBeginningOfHtmlNode(nodeType, line)) {
        tree.push(...this.#flushBuffer(buffer));
        nodeType = "html";
      }

      // 子ノードの終わりなら、再帰的に木を取得、バッファをクリア、現在ノードへ
      if (this.#isEndOfChildNode(nodeType, line)) {
        tree.push(this.#getTreeRecursive([...buffer].map((line) => line.replace(/^ {2}/, ""))));
        buffer.length = 0;
        nodeType = "current";
      }

      // 現在ノードかつ空行なら
      if (nodeType === "current" && line.match(/^ *$/)) {
        // バッファをフラッシュ
        tree.push(...this.#flushBuffer(buffer));
      } else {
        // バッファに行をプッシュ
        buffer.push(line);
      }

      // HTML ノードの終わりなら、バッファをフラッシュ、現在ノードへ
      if (this.#isEndOfHtmlNode(nodeType, buffer)) {
        tree.push(...this.#flushBuffer(buffer));
        nodeType = "current";
      }
    }

    // 残ったバッファを処理
    if (nodeType === "child") {
      tree.push(this.#getTreeRecursive([...buffer].map((line) => line.replace(/^ {2}/, ""))));
      buffer.length = 0;
    } else {
      tree.push(...this.#flushBuffer(buffer));
    }
    return tree;
  }

  ////////

  // 木を得る
  static getTree(input) {
    return this.#getTreeRecursive(input.split("\n")); 
  }

  ////////

  // 再帰的に HTML を得る
  static #getHtmlRecursive(tree, depth = 0) {
    let html = "";
    for (const key in tree) {
      const i = parseInt(key);
      const node = tree[i];
      if (Array.isArray(node)) {
        html += "<div>\n" + this.#getHtmlRecursive(node, depth + 1).trim().split("\n").map((line) => `  ${line}`).join("\n") + "\n</div>";
      } else {
        if (this.#isClosedHtml(node)) {
          html += node;
        } else {
          if (i < tree.length - 1 && Array.isArray(tree[i + 1])) {
            html += `<h${depth + 1}>${node}</h${depth + 1}>\n`;
          } else {
            html += "<p>\n" + node.split("\n").map((line) => `  ${line}<br>`).join("\n") + "\n</p>\n";
          }
        }
      }
    }
    return html;
  }

  // HTML を得る
  static getHtml(tree, depth = 0) {
    let indent = 0;
    html = "";
    for (const line of this.#getHtmlRecursive(tree).split("\n")) {
      if (line.match(/^ *<pre>$/)) {
        indent = line.replace(/^( *).*?$/, "$1").length + 2;
      }
      html += line.replace(new RegExp(`^ {0,${indent}}`), "") + "\n";
      if (line.match(/^ *<\/pre>$/)) {
        indent = 0;
      }
    }
    return html;
  }
}
