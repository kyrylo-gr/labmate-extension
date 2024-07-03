import * as vscode from 'vscode';

export enum CodeItemType {
  AcquisitionCell = 'acquisition_cell',
  AnalysisCell = 'analysis_cell'
}
export interface CodeItem {
  type: CodeItemType;
  label: string;
  cellIndex: number;
  index?: number;
}
export class TreeItem {
  public readonly label: string;
  public readonly level: number;
  public readonly cellIndex: number;
  public children: TreeItem[];
  public parent: TreeItem | null = null;
  public codes: CodeItem[] = [];

  constructor(
    label: string,
    level: number,
    cellIndex: number,
    parent: TreeItem | null = null
  ) {
    this.label = label;
    this.level = level;
    this.parent = parent;
    this.cellIndex = cellIndex;
    this.children = [];
    this.codes = [];
  }

  addChild(child: TreeItem): void {
    this.children.push(child);
  }
  addNextItem(label: string, level: number, index: number): TreeItem {
    let currentLevel = this.level;
    // console.log('Adding next item', label, level, index, currentLevel);
    let currentParent: TreeItem | null = this;
    if (currentLevel < level - 1) {
      level = currentLevel + 1;
    }
    while (currentLevel >= level && currentParent !== null) {
      currentParent = currentParent?.parent ?? null;
      currentLevel -= 1;
    }
    if (currentParent === null) {
      throw new Error('Invalid level');
    }
    // console.log('Adding item', label, level, index, currentLevel);
    const item = new TreeItem(label, level, index, currentParent);
    currentParent.addChild(item);
    return item;
  }
  addCodeItem(label: string, type: CodeItemType, cellIndex: number): void {
    this.codes.push({ label, type, cellIndex: cellIndex });
  }

  removeChildren(): void {
    this.children = [];
  }

  toHtml(): string {
    let html = `<li class="level-${this.level}">
    <div class="tree-item" data-cell-index="${this.cellIndex}">${this.label}</div>`;
    if (this.codes.length > 0) {
      html += '<div class="code-items">';
      this.codes.forEach((code: CodeItem) => {
        const label = code.type === CodeItemType.AcquisitionCell ? 'Q' : 'A';
        html += `<div class="code-item" data-cell-index="${code.cellIndex}">${label}</div>`;
      });
      html += '</div>';
    }
    if (this.children.length > 0) {
      html += '<ul>';
      this.children.forEach((child: TreeItem) => {
        html += child.toHtml();
      });
      html += '</ul>';
    }
    html += '</li>';
    return html;
  }
}

export class parseTree {
  readonly baseItem: TreeItem;

  constructor() {
    this.baseItem = new TreeItem('root', 0, 0);
  }

  toHtml(): string {
    let html = '';
    if (this.baseItem.children.length > 0) {
      html += '<ul>';
      this.baseItem.children.forEach((child: TreeItem) => {
        html += child.toHtml();
      });
      html += '</ul>';
    }
    return html;
  }

  parseNotebook(cells: vscode.NotebookCell[]): void {
    // Clear the current outline

    console.log('Parsing notebook', cells);
    this.baseItem.removeChildren();
    let currentItem = this.baseItem;
    try {
      cells.forEach((cell: vscode.NotebookCell) => {
        if (cell.kind === vscode.NotebookCellKind.Markup) {
          const lines = cell.document.getText().split('\n');
          lines.forEach((line: string) => {
            // console.log('line', line);
            const match = line.match(/^(#+)\s+(.+)/);
            if (match) {
              const level = match[1].length;
              const title = match[2];
              currentItem = currentItem.addNextItem(title, level, cell.index);
            }
          });
        }
        if (cell.kind === vscode.NotebookCellKind.Code) {
          const code = cell.document.lineAt(0).text;
          const match = code.match(/^aqm.acquisition_cell\(/);
          if (match) {
            const title = match[1];
            currentItem.addCodeItem(
              title,
              CodeItemType.AcquisitionCell,
              cell.index
            );
          } else {
            if (code.match(/^aqm.analysis_cell\(/)) {
              currentItem.addCodeItem(
                "",
                CodeItemType.AnalysisCell,
                cell.index
              );
            }
          }
        }

        // cell.outputs.forEach((output: vscode.NotebookCellOutput) => {
        //   console.log('output', output);
        // });
      });
    } catch (error) {
      vscode.window.showErrorMessage('Failed to parse the notebook');
      console.error(error);
    }
  }
}
