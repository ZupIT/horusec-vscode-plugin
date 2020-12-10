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
  _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

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
    this._onDidChangeTreeData.fire();
  }

  public resetTree(): void {
    this.data = [];
  }

  private parseVulnerabilitiesToChildrenContent(vulnerabilities: Vulnerability[]): any{
    const allTreeItens = vulnerabilities.reduce((previousVulnerability, currentVulnerability) => {
      var names = currentVulnerability.file.replace(vscode.workspace.rootPath + '/', '').split('/');

      names.reduce((previousName: any, currentName: any, index) => {
        let temp: TreeItem = previousName.find((o: any) => o.label === currentName);

        if (!temp) {
          temp = new TreeItem(currentName, []);
          previousName.push(temp);
        };

        if (index + 1 === names.length) {
          const vuln = new TreeItem(currentVulnerability.details);

          if (!temp.children) {
            temp.children = [];
          }
          temp.children.push(vuln);
        }

        return temp.children;
      }, previousVulnerability);
      return previousVulnerability;
    }, []);

    return allTreeItens;
  }
}
