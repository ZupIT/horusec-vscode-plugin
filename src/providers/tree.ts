/**
 * Copyright 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { Vulnerability } from '../entities/vulnerability';
import { createDiagnosticRange } from '../util/diagnostics';

export class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;
  vulnHash?: string;

  constructor(label: string, children?: TreeItem[], vulnHash?: string) {
    super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
    this.vulnHash = vulnHash;
  }
}

export class TreeProvider implements vscode.TreeDataProvider<TreeItem> {
  _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private data: TreeItem[] = [];
  private context: vscode.ExtensionContext;

  constructor(_context: vscode.ExtensionContext) {
    this.context = _context;
    this.resetTree();
  }

  public getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  public getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }

  public removeChildren(vulnHash: string) {
    this.data = this.data.map((file) => {
      if (file) {
        const filteredFile = {
          ...file,
          children: file.children.filter((vuln) => vuln.vulnHash !== vulnHash),
        };

        if (filteredFile.children.length <= 0) {
          return null;
        } else {
          return filteredFile;
        }
      }
    });

    this._onDidChangeTreeData.fire();
  }

  public insertVulnerabilities(vulnerabilities: Vulnerability[]): void {
    this.resetTree();
    this.data = this.parseVulnerabilitiesToTreeItens(vulnerabilities);
    this._onDidChangeTreeData.fire();
  }

  public resetTree(): void {
    this.data = [];
    this._onDidChangeTreeData.fire();
  }

  public openFile(vuln: Vulnerability): void {
    if (vuln && vuln.file) {
      const openPath = vscode.Uri.file(vuln.file);
      vscode.workspace.openTextDocument(openPath).then((doc) => {
        vscode.window.showTextDocument(doc).then((editor) => {
          const range = createDiagnosticRange(doc, parseInt(vuln.line, 10));
          editor.revealRange(range);
          editor.selection = new vscode.Selection(range.start, range.end);
        });
      });
    }
  }

  private parseVulnerabilitiesToTreeItens(vulnerabilities: Vulnerability[]): any {
    return vulnerabilities.reduce((previousVulnerability, currentVulnerability) => {
      var names = currentVulnerability.file.replace(vscode.workspace.rootPath + '/', '').split('/');

      names.reduce((previousName: any, currentName: any, index: number) => this.execReducePathToListTreeItem(previousName, currentName, index, currentVulnerability, names.length), previousVulnerability);
      return previousVulnerability;
    }, []);
  }

  private execReducePathToListTreeItem(previousName: any, currentName: any, index: number, currentVulnerability: Vulnerability, namesLength: number): TreeItem[] | undefined {
    let temp: TreeItem = previousName.find((o: any) => o.label === currentName);

    if (!temp) {
      temp = new TreeItem(currentName, []);
      previousName.push(temp);
    }

    if (index + 1 === namesLength) {
      temp.iconPath = this.getIconPathByType('FILE');

      if (!temp.children) {
        temp.children = [];
      }

      temp.children.push(this.createVulnerabilityInFileToTreeItem(currentVulnerability));
    } else {
      temp.iconPath = this.getIconPathByType('FOLDER');
    }

    return temp.children;
  }

  private createVulnerabilityInFileToTreeItem(currentVulnerability: Vulnerability): TreeItem {
    const { details, language, securityTool } = currentVulnerability;
    const label = `${language} - ${securityTool} : ${details}`;
    const vuln = new TreeItem(label, undefined, currentVulnerability.vulnHash);
    const basePath: string = vscode.workspace.rootPath || '';
    vuln.command = {
      command: 'horusec.open',
      title: 'Open file',
      arguments: [
        {
          ...currentVulnerability,
          file: path.join(basePath, currentVulnerability.file),
        },
      ],
    };
    vuln.iconPath = this.getIconPathByType(currentVulnerability.severity);
    vuln.description = `${currentVulnerability.file}[${currentVulnerability.line}:${currentVulnerability.column}] ${currentVulnerability.severity} `;
    vuln.tooltip = vuln.description + vuln.label;
    return vuln;
  }

  private getIconPathByType(type: string): string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } | vscode.ThemeIcon | undefined {
    switch (type) {
      case 'CRITICAL':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'critical.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'critical.svg')),
        };
      case 'HIGH':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'high.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'high.svg')),
        };
      case 'MEDIUM':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'medium.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'medium.svg')),
        };
      case 'LOW':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'low.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'low.svg')),
        };
      case 'INFO':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'info.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'info.svg')),
        };
      case 'UNKNOWN':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'unknown.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'unknown.svg')),
        };
      case 'FOLDER':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'folder.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'folder.svg')),
        };
      case 'FILE':
        return {
          light: this.context.asAbsolutePath(path.join('resources', 'light', 'file.svg')),
          dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'file.svg')),
        };
      default:
        return undefined;
    }
  }
}
