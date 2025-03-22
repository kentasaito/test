export const layout = (contents: string) => `
<!DOCTYPE html>
<link rel="stylesheet" href="./site/static/assets/default.css" />
<link rel="stylesheet" href="./site/static/assets/demo.css" />
<header>
  <a href="./index.html">
    <img src="./logo.svg" style="height: 32px; vertical-align: top;">
  </a>
  <a href="./syntax.html">Syntax</a>
  <a href="./demo.html">Demo</a>
  <a href="./download.html">Download</a>
  <a href="https://jsr.io/@kenta/test">JSR</a>
  <a href="https://github.com/kentasaito/test">GitHub</a>
</header>
${contents}
<hr>
`;
