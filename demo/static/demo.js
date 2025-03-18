import { Indentdown } from "./Indentdown.js";

function render(input) {
  const tree = Indentdown.getTree(input);
  const html = Indentdown.getHtml(tree);
  document.querySelector("#tree").value = JSON.stringify(tree, null, 2) + "\n";
  document.querySelector("#html").value = html + "\n";
  document.querySelector("#output").innerHTML = html + "\n";
}

function selectPane(type) {
  document.getElementById("tree").style.display = type === "tree"
    ? "block"
    : "none";
  document.getElementById("html").style.display = type === "html"
    ? "block"
    : "none";
  document.getElementById("output").style.display = type === "output"
    ? "block"
    : "none";
}

globalThis.addEventListener("pageshow", () => {
  const editor = ace.edit(document.querySelector("#input pre"));
  editor.session.setTabSize(2);
  editor.session.setValue(`Indentdown
  Indentdownは、Markdownのような軽量マークアップ言語です。
  テキストを木構造にする変換と、木構造をHTMLにする変換とで構成されます。

  テキストを木構造にする変換
    テキストの"\<"は"&lt;"に変換される。
    テキストの"\>"は"&gt;"に変換される。
    テキストをいくつかのノードに変換する。
    ノードの深さはインデントの深さに等しい。
    ノードはノードタイプ、値、及び0個以上の子ノードを持つ。

    定義
      改行
        U+000A。

      行
        テキストを改行で分割した部分。

      スペース
        U+0020。

      空行
        0個以上のスペースのみからなる行。

      インデントの深さ
        各ノードの最初の行の行頭から続くスペースの個数を2で割った数以下の最大の整数。

    ノードタイプ
      HTMLノード
        テキストの内、閉じたHTML部分。
        値としてそれ自身の値を持つ。
        0個の子ノードを持つ。

      親ノード
        インデントの深さが0を超える行と空行の連続からなる部分。
        値として空文字列を持つ。
        子ノードとして、それ自身の値を再帰的に変換した結果を持つ。

      テキストノード
        テキストの内、HTMLノードでも子ノードでもない部分を空行で分割した部分。
        値としてそれ自身の値を持つ。
        0個の子ノードを持つ。

  木構造をHTMLにする変換
    親ノード
      子ノードを再帰的に変換した結果のインテントの深さに1を加え、
      &lt;div&gt;と&lt;/div&gt;とで囲む。

    HTMLノード
      変換を行わない。
      但し&lt;pre&gt;と&lt;/pre&gt;とで囲まれた部分は適切にアンインデントされる。

    テキストノード
      次のノードが親ノードなら
        &lt;h(ノードの深さ+1)&gt;と&lt;/h(ノードの深さ+1)&gt;とで囲む。

      次のノードが親ノードでないなら
        値の各行のインデントの深さに1を加え、
        値の各行の末尾に&lt;/br&gt;を加え、
        &lt;p&gt;と&lt;/p&gt;とで囲む。
`);

  document.querySelector("#input").addEventListener("keyup", () => {
    render(editor.getValue());
  });

  document.querySelector("#type").addEventListener("change", (e) => {
    selectPane(e.target.value);
  });

  selectPane(document.querySelector("#type [name='type']:checked").value);
  render(editor.getValue());
});
