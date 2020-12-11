import * as vscode from 'vscode';

class HelpItem extends vscode.TreeItem {
    children: HelpItem[] | undefined;

    constructor(label: string, children?: HelpItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded
        );
        this.children = children;
    }
}

export class HelpNodeProvider implements vscode.TreeDataProvider<HelpItem> {
    _onDidChangeTreeData = new vscode.EventEmitter<HelpItem | undefined | null | void>();
    onDidChangeTreeData: vscode.Event<HelpItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private data: HelpItem[] = [];
    private context: vscode.ExtensionContext;

    constructor(_context: vscode.ExtensionContext) {
        this.context = _context;
    }

    public getTreeItem(element: HelpItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public getChildren(element?: HelpItem | undefined): vscode.ProviderResult<HelpItem[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}
