// @ts-types="npm:@types/vscode";
import * as vscode from "vscode";
import { Indentdown } from "./Indentdown.ts";

const panels: (vscode.WebviewPanel | undefined)[] = [
  undefined,
  undefined,
];

function createPanels() {
  panels.forEach((_panel, i) => {
    if (panels[i] === undefined) {
      panels[i] = vscode.window.createWebviewPanel(
        "indentdown",
        `Indentdown (${i === 0 ? "raw" : "rendered"})`,
        vscode.ViewColumn.Two,
      );
      panels[i].onDidDispose(() => {
        panels[i] = undefined;
      });
    }
  });
}

function renderPreview() {
  if (vscode.window.activeTextEditor?.document.fileName.match(/\.id$/)) {
    const html = Indentdown.getHtml(
      vscode.window.activeTextEditor?.document.getText() ?? "",
    );
    panels.forEach((_panel, i) => {
      if (panels[i] !== undefined) {
        panels[i].webview.html = i === 0
          ? `<pre>\n${html.replace(/</g, "&lt;").replace(/>/g, "&gt;")}\n<pre>`
          : html;
      }
    });
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("indentdown.preview", () => {
      createPanels();
      renderPreview();
      vscode.workspace.onDidChangeTextDocument(() => {
        renderPreview();
      });
    }),
  );
}

export function deactivate() {}
