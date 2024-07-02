import * as vscode from 'vscode';

export class OutlineViewProvider implements vscode.TreeDataProvider<OutlineItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<OutlineItem | undefined | void> = new vscode.EventEmitter<OutlineItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<OutlineItem | undefined | void> = this._onDidChangeTreeData.event;

  private outline: OutlineItem[] = [];

  constructor() {
    // You can add your logic here to populate the outline
    this.outline = [
      new OutlineItem('Section 1', []),
      new OutlineItem('Section 2', [
        new OutlineItem('Subsection 2.1', []),
        new OutlineItem('Subsection 2.2', [])
      ])
    ];
  }

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
}

export class OutlineItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly children: OutlineItem[]
  ) {
    super(
      label,
      children.length === 0 ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed
    );
  }
}
