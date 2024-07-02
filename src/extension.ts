// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { OutlineViewProvider } from './outlineView';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "labmate" is now active!');
	
	const outlineProvider = new OutlineViewProvider();
	vscode.window.registerTreeDataProvider('labmate-outline', outlineProvider);

	const disposable = vscode.commands.registerCommand('labmate.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		console.log('Hello World from labmate111!');
		vscode.window.showInformationMessage('Hello World from labmate222!');
	});
	context.subscriptions.push(disposable);
	
  
	let disposable2 = vscode.commands.registerCommand('extension.refreshOutline', () => {
	  outlineProvider.refresh();
	});

	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
