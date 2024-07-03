import * as vscode from 'vscode';

export class OutlineViewProvider
  implements vscode.WebviewViewProvider
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    OutlineItem | undefined | void
  > = new vscode.EventEmitter<OutlineItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<OutlineItem | undefined | void> =
    this._onDidChangeTreeData.event;

  private outline: OutlineItem[] = [];

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: OutlineItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OutlineItem): Thenable<OutlineItem[]> {
    if (element === undefined) {
      return Promise.resolve(this.outline);
    }
    return Promise.resolve(element.children);
  }

  parseNotebook(cells: vscode.NotebookCell[]): void {
    // Clear the current outline

    console.log('Parsing notebook', cells);
    this.outline = [];

    try {
      cells.forEach((cell: vscode.NotebookCell) => {
        
        if (cell.kind === vscode.NotebookCellKind.Markup) {
          const lines = cell.document.getText().split('\n');
          lines.forEach((line: string) => {
            console.log('line', line);
            const match = line.match(/^(#+)\s+(.+)/);
            if (match) {
              const level = match[1].length;
              const title = match[2];
              this.addOutlineItem(1, title);
            }
          });
        }
        if (cell.kind === vscode.NotebookCellKind.Code) {
          const code = cell.document.lineAt(0).text;
          const match = code.match(
            /^^aqm.acquisition_cell\([\"\']([^\"\']+)[\"\']\)/
          );
          if (match) {
            const title = match[1];
            this.addOutlineItem(1, title);
          }
        }

        cell.outputs.forEach((output: vscode.NotebookCellOutput) => {
            console.log('output', output);
        });
      });

      this.refresh();
    } catch (error) {
      vscode.window.showErrorMessage('Failed to parse the notebook');
      console.error(error);
    }
  }

  addOutlineItem(level: number, title: string): void {
    const newItem = new OutlineItem(title, []);

    if (level === 1) {
      this.outline.push(newItem);
    } else {
      let parent = this.outline[this.outline.length - 1];
      for (let i = 1; i < level - 1; i++) {
        if (parent.children.length > 0) {
          parent = parent.children[parent.children.length - 1];
        } else {
          const tempItem = new OutlineItem('', []);
          parent.children.push(tempItem);
          parent = tempItem;
        }
      }
      parent.children.push(newItem);
    }
  }
}

export class OutlineItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly children: OutlineItem[]
  ) {
    super(
      label,
      children.length === 0
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed
    );
  }
}
