import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { Vulnerability } from './entities/vulnerability';

class TreeItem extends vscode.TreeItem {
  children: TreeItem[]|undefined;

  constructor(label: string, children?: TreeItem[]) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded
    );
    this.children = children;
  }
}


export class TreeNodeProvider implements vscode.TreeDataProvider<TreeItem> {
  onDidChangeTreeData?: vscode.Event<TreeItem|null|undefined>|undefined;

  private data: TreeItem[] = [];

  constructor() {
    this.resetTree();
  }

  public getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
  public insertVulnerabilities(vulnerabilities: Vulnerability[]): void {
    this.resetTree();
    this.data = this.parseVulnerabilitiesToChildrenContent(vulnerabilities);
  }

  public resetTree(): void {
    this.data = [];
  }

  private parseVulnerabilitiesToChildrenContent(vulnerabilities: Vulnerability[]): any{
    const allTreeItens = vulnerabilities.reduce((r, p) => {
      p.file = p.file.replace(vscode.workspace.rootPath + '/', '');
      var names = p.file.split('/');
      names.reduce((q: any, name: any, index) => {
        let temp = q.find((o: any) => o.label === name);

        if (!temp) {
          temp = new TreeItem(name, []);
          q.push(temp);
        };

        return temp.children;
      }, r);
      return r;
    }, []);

    return [new TreeItem('Vulnerabilities', allTreeItens)];
  }
}
