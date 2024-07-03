import * as vscode from 'vscode';
import { parseTree } from './parseTree';

export class PanelViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'labmateView';

  private _editor?: vscode.NotebookEditor;

  private _view?: vscode.WebviewView;
  private parseTree: parseTree;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._extensionUri = _extensionUri;
    this.parseTree = new parseTree();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case 'goToCell': {
          this.goToCell(parseInt(data.cellIndex ?? "-1"));
          break;
        }
      }
    });
  }
  public refresh() {
    if (!this._view) return;
	const tree_html= this.parseTree.toHtml();

	this._view.webview.postMessage({ type: 'refresh', html: tree_html });
  }

  public parseNotebook(editor: vscode.NotebookEditor) {
    console.log('Parsing notebook');
    this._editor = editor;
    this.parseTree.parseNotebook(editor.notebook.getCells());
    console.log('parseTree', this.parseTree.baseItem);

    this.refresh();
  }

  public goToCell(cellIndex: number) {
    // console.log('goToCell', cellIndex);
    if (!this._editor) return;
	this._editor?.revealRange(new vscode.NotebookRange(cellIndex, cellIndex+1), vscode.NotebookEditorRevealType.AtTop);
  }

  private _getHtmlForWebview(): string {
    if (!this._view) {
      return '';
    }
    const webview = this._view.webview;
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'panel.js')
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'panel.css')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css')
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

	const tree_html= this.parseTree.toHtml();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Cat Colors</title>
			</head>
			<body>
			<div id="main">
			${tree_html}
			</div>
				<button class="go-to-cell">Go to Cell</button>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
