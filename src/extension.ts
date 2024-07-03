import * as vscode from 'vscode';
// import { OutlineViewProvider, OutlineItem } from './outlineView';
import { PanelViewProvider } from './panelViewProvider';

export function activate(context: vscode.ExtensionContext) {
  const panelViewProvider = new PanelViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PanelViewProvider.viewType,
      panelViewProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.refreshOutline', async () => {
      console.log('Parsing notebook event');
      const editor = vscode.window.activeNotebookEditor;
      console.log('editor', editor);
      if (editor) {
        // editor?.revealRange(new vscode.NotebookRange(15, 15));
        panelViewProvider.parseNotebook(editor);
      }
    })
  );

  vscode.window.onDidChangeActiveNotebookEditor((editor) => {
    console.log('onDidChangeActiveNotebookEditor', editor);

    if (editor) vscode.commands.executeCommand('extension.refreshOutline');
  });

  // Trigger the command to parse the notebook when a notebook is opened or saved
  vscode.workspace.onDidOpenNotebookDocument((document) => {
    console.log('onDidOpenTextDocument', document);
    if (document) vscode.commands.executeCommand('extension.refreshOutline');
  });

  vscode.workspace.onDidSaveNotebookDocument((document) => {
    console.log('onDidSaveTextDocument', document);
    if (document) vscode.commands.executeCommand('extension.refreshOutline');
  });

  // Parse the notebook if one is already open
  if (
    vscode.window.activeTextEditor &&
    vscode.window.activeTextEditor.document.fileName.endsWith('.ipynb')
  ) {
    vscode.commands.executeCommand('extension.parseNotebook');
  }
}

export function deactivate() {}
