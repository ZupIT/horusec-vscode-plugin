import * as vscode from 'vscode';
import { statusLoading } from './util/loading';
import { HelpProvider, TreeProvider } from './providers';
import { setAsFalsePositive, setAsRiskAccept, startHorusec, stopHorusec } from './commands';

let vulnsProvider: TreeProvider;
let helpProvider: HelpProvider;
let horusecView: vscode.Disposable;

const vulnDiagnostics = vscode.languages.createDiagnosticCollection('vulnerabilities');

function activate(context: vscode.ExtensionContext) {
  vulnsProvider = new TreeProvider(context);
  horusecView = vscode.window.registerTreeDataProvider('vulnerabilitiesView', vulnsProvider);
  context.subscriptions.push(horusecView);
  context.subscriptions.push(vulnDiagnostics);
  context.subscriptions.push(statusLoading);

  context.subscriptions.push(vscode.commands.registerCommand('horusec.start',
    async () => startHorusec()));

  context.subscriptions.push(vscode.commands.registerCommand('horusec.stop',
    async () => stopHorusec()));

  context.subscriptions.push(vscode.commands.registerCommand('horusec.open',
    async (e) => vulnsProvider.openFile(e)));

  context.subscriptions.push(vscode.commands.registerCommand('horusec.setFalsePositive',
    async (e) => setAsFalsePositive(e)));

  context.subscriptions.push(vscode.commands.registerCommand('horusec.setRiskAccept',
    async (e) => setAsRiskAccept(e)));

  context.subscriptions.push(vscode.workspace.createFileSystemWatcher('**/*.*').onDidDelete(uri => {
    vulnDiagnostics.delete(uri);
  }));

  helpProvider = new HelpProvider(context);
  vscode.window.registerTreeDataProvider('helpView', helpProvider);
  context.subscriptions.push(vscode.commands.registerCommand('horusec.openLink', async (e) => helpProvider.openLink(e)));
}

function deactivate() { }

export {
  activate,
  deactivate,
  vulnDiagnostics,
  vulnsProvider,
};
