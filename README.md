# Indentdown
Indentdownは、Markdownのような軽量マークアップ言語です。
テキストを木構造にする変換と、木構造をHTMLににする変換とで構成されます。

### 例
```sh
echo -e "Header\n  Paragraph" | deno run ./src/Indentdown.ts
```
```html
<h1>Header</h1>
<div>
  <p>
    Paragraph<br>
  </p>
</div>
```
