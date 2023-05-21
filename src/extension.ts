import {
  window,
  commands,
  Disposable,
  ExtensionContext,
  ViewColumn,
  WebviewPanel,
  workspace,
} from "vscode";
import { marked } from "marked";

import { extname } from "path";

let panelState: WebviewPanel | null;
export function activate(context: ExtensionContext) {
  let commandDisposable = commands.registerCommand("live-readme.live", () => {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
      window.showInformationMessage(
        `Please open a .md file and run the command to see the magic`
      );
      return;
    }
    const activeDocument = activeEditor.document;
    const fileName = activeDocument.fileName;
    if (extname(fileName) !== ".md") {
      window.showInformationMessage(
        `Sorry this extension only works with .md files`
      );
      return;
    }
    panelState = openWebView(activeDocument.getText());
  });

  const saveDisposable = workspace.onDidChangeTextDocument((event) => {
    const activeTextEditor = window.activeTextEditor;
    if (
      activeTextEditor &&
      event.document === activeTextEditor.document &&
      extname(activeTextEditor.document.fileName) === ".md" &&
      panelState
    ) {
      panelState.webview.html = marked.parse(
        activeTextEditor.document.getText()
      );
    }
  });
  context.subscriptions.push(commandDisposable, saveDisposable);
}
export function deactivate() {
  panelState = null;
}

function openWebView(markdown: string) {
  const panel = window.createWebviewPanel(
    "live-readme",
    "Live Readme",
    ViewColumn.Beside,
    {
      enableScripts: true,
    }
  );
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
    ${marked.parse(markdown)}
</body>
</html>`;
  // Set the HTML content in the WebView
  panel.webview.html = htmlContent;
  return panel;
}
