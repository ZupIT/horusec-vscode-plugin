import * as vscode from 'vscode';
import * as path from 'path';

export class HelpProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private data: vscode.TreeItem[] = [];
  private context: vscode.ExtensionContext;

  constructor(_context: vscode.ExtensionContext) {
    this.context = _context;
    this.renderLinksList();
  }

  public getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(element: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element === undefined) {
      return Promise.resolve(this.data);
    }
    return Promise.resolve([element]);
  }

  public renderLinksList() {
    this.data = [
      new ItemLink('Discover the Horusec', 'https://horusec.io/', 'rocket.svg', this.context),
      new ItemLink('Extension documentation', 'https://horusec.io/docs/extensions/visual-studio-code/', 'book.svg', this.context),
      new ItemLink('Horusec documentation', 'https://horusec.io/docs/overview/', 'book.svg', this.context),
      new ItemLink('Source Code', 'https://github.com/ZupIT/horusec-vscode-plugin', 'github.svg', this.context),
      new ItemLink('Review Issues', 'https://github.com/ZupIT/horusec-vscode-plugin/issues', 'message.svg', this.context),
      new ItemLink('Report Issue', 'https://github.com/ZupIT/horusec-vscode-plugin/issues/new/choose', 'alert.svg', this.context)
    ],

      this._onDidChangeTreeData.fire();
  }

  public openLink(link: string) {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link));
  }
}


class ItemLink extends vscode.TreeItem {
  constructor(label: string, link: string, icon: string, context: vscode.ExtensionContext) {
    super(
      label,
    );

    this.command = {
      command: 'horusec.openLink',
      title: 'Open link',
      arguments: [link]
    };

    this.iconPath = {
      dark: context.asAbsolutePath(path.join('resources', 'dark', icon)),
      light: context.asAbsolutePath(path.join('resources', 'light', icon))
    };
  }
}
