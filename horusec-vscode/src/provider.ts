import * as vscode from 'vscode';

export class TreeNodeProvider implements vscode.TreeDataProvider<any> {
  _context: vscode.ExtensionContext;
  constructor(
    context: vscode.ExtensionContext,
    debug: boolean
  ) {
    this._context = context;
  }

  getTreeItem(node: any = { label: '' }): vscode.TreeItem | Thenable<vscode.TreeItem> {
    let treeItem: vscode.TreeItem = new vscode.TreeItem(node.label + (node.pathLabel ? (' ' + node.pathLabel) : ''));
    treeItem.id = node.id;
    treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
    treeItem.description = node.label;
    treeItem.label = '';
    treeItem.tooltip = node.tooltip;

    if (node.isFolder === true) {
      treeItem.contextValue = 'folder';
    }
    else if (!node.isRootTagNode && !node.isWorkspaceNode && !node.isStatusNode) {
      treeItem.contextValue = 'file';
    }

    return treeItem;
  }

  getChildren(node?: any): vscode.ProviderResult<any[]> {
    const nodes: Array<any> = [];
    return nodes;
  }

  dispose() { };
}
