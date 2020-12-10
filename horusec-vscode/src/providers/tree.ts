import * as vscode from 'vscode';
import * as path from 'path';
import { Vulnerability } from '../entities/vulnerability';
import { createDiagnosticRange } from '../util/diagnostics';

class TreeItem extends vscode.TreeItem {
    children: TreeItem[] | undefined;

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
            vscode.workspace.openTextDocument(openPath)
                .then((doc) => {
                    vscode.window.showTextDocument(doc)
                        .then((editor) => {
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

            names.reduce((previousName: any, currentName: any, index: number) =>
                this.execReducePathToListTreeItem(previousName, currentName, index, currentVulnerability, names.length),
                previousVulnerability
            );
            return previousVulnerability;
        }, []);
    }

    private execReducePathToListTreeItem(
        previousName: any,
        currentName: any,
        index: number,
        currentVulnerability: Vulnerability,
        namesLength: number
    ): TreeItem[] | undefined {
        let temp: TreeItem = previousName.find((o: any) => o.label === currentName);

        if (!temp) {
            temp = new TreeItem(currentName, []);
            previousName.push(temp);
        };

        if (index + 1 === namesLength) {
            temp.iconPath = vscode.ThemeIcon.File;

            if (!temp.children) {
                temp.children = [];
            }

            temp.children.push(this.createVulnerabilityInFileToTreeItem(currentVulnerability));
        } else {
            temp.iconPath = vscode.ThemeIcon.Folder;
        }

        return temp.children;
    }

    private createVulnerabilityInFileToTreeItem(currentVulnerability: Vulnerability): TreeItem {
        const vuln = new TreeItem(currentVulnerability.details);
        vuln.command = {
            command: 'horusec.open',
            title: 'Vulnerability',
            arguments: [
                currentVulnerability,
            ]
        };
        vuln.iconPath = this.getIconPathBySeverity(currentVulnerability.severity);
        vuln.description = `${currentVulnerability.file}[${currentVulnerability.line}:${currentVulnerability.column}] `;
        vuln.tooltip = vuln.description + vuln.label;
        return vuln;
    }

    private getIconPathBySeverity(severity: string): string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; } | vscode.ThemeIcon | undefined {
        switch (severity) {
            case 'HIGH':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'severity-high.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'severity-high.svg'))
                };
            case 'MEDIUM':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'severity-medium.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'severity-medium.svg'))
                };
            case 'LOW':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'severity-low.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'severity-low.svg'))
                };
            case 'AUDIT':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'severity-audit.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'severity-audit.svg'))
                };
            case 'INFO':
                return {
                    light: this.context.asAbsolutePath(path.join('resources', 'light', 'severity-info.svg')),
                    dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'severity-info.svg'))
                };
            default:
                return undefined;
        }
    }
}
