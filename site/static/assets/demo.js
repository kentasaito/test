import { Indentdown } from "../../../dist/Indentdown.min.js";

function changeMode() {
  const formData = new FormData(document.getElementById("form"));
  const mode = formData.get("mode");
  document.getElementById("raw").hidden = mode !== "raw";
  document.getElementById("html").hidden = mode !== "html";
}

function render() {
  const html = Indentdown.getHtml(document.getElementById("input").value);
  document.getElementById("raw").innerText = html;
  document.getElementById("html").innerHTML = html;
}

document.getElementById("form").addEventListener("change", () => {
  changeMode();
});

document.getElementById("input").addEventListener("keyup", () => {
  render();
});

changeMode();
render();
