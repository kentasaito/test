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
  Indentdown は Markdown のような軽量マークアップ言語です。
  テキストを木構造および HTML に変換します。

  テキストから木構造
    テキストのインデントの深さはノードの深さに対応します。

    テキストの以下の部分がノードに変換されます。
    <ul>
      <li>閉じた HTML</li>
      <li>空行で挟まれた部分</li>
      <li>異なるインデントの深さで挟まれた部分</li>
    </ul>

  木構造から HTML
    ノードは以下の条件に従い HTML に変換されます。

    閉じた HTML
      整形済みテキストのとき
        適切にアンインデントされた HTML

      そうではないとき
        入力された HTML そのもの

    そうではないとき
      次のノードがより深いとき
        深さに対応したヘッダー

      そうではないとき
        各行の終端にブレイクを追加したパラグラフ
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
