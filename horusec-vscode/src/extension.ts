import * as vscode from 'vscode';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { subscribeToDocumentChanges } from './util/diagnostics';
import { TreeNodeProvider } from './providers/tree';
import { HelpNodeProvider } from './providers/help';
import { parseOutputToAnalysis, parseAnalysisToVulnerabilities } from './util/parser';

let isLoading: boolean;
let vulnsProvider: TreeNodeProvider;
let horusecView: vscode.Disposable;
const containerName = 'horusec-cli';
const vulnDiagnostics = vscode.languages.createDiagnosticCollection("vulnerabilities");
const statusLoading = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
statusLoading.text = '$(sync~spin) Horusec: Security analysis running';
statusLoading.tooltip = 'Hold on! Horusec is analyzing your code.';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.registerTreeDataProvider('vulnerabilitiesView', new HelpNodeProvider(context));

    vulnsProvider = new TreeNodeProvider(context);
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
    context.subscriptions.push(vscode.workspace.createFileSystemWatcher('**/*.*').onDidDelete(uri => {
        vulnDiagnostics.delete(uri);
    }));
}

function stopHorusec() {
    if (vscode.workspace.rootPath === undefined) {
        vscode.window.showErrorMessage('Horusec: No valid workspace found.');
        return;
    }

    execStopCommand();
}

function startHorusec() {
    if (vscode.workspace.rootPath === undefined) {
        vscode.window.showErrorMessage('Horusec: No valid workspace found.');
        return;
    }
    if (isLoading) {
        vscode.window.showWarningMessage('Horusec: Hold on! Horusec is analyzing his code.');
        return;
    }

    vscode.window.showInformationMessage(`Horusec: Hold on! Horusec started to analysis your code.`);
    execStartCommand();
}

function execStopCommand() {
    exec(getRemoveContainerCommand(), (error: any) => {
        if (error && !error.stack.contains('No such container: horusec-cli')) {
            vscode.window.showErrorMessage(`Horusec stop failed: ${error.message}`);
            console.log('error', error);
        }

        stopLoading();
    });
}

function execStartCommand() {
    startLoading();
    vulnsProvider.resetTree();
    exec(getStartCommand(), (error: any, stdout: any) => {
        if (error) {
            if (!error.stack.contains('at ChildProcess.exithandler')) {
                vscode.window.showErrorMessage(`Horusec analysis failed: ${error.message}`);
                console.log('error', error);
            }
        } else {
            exec(getRemoveContainerCommand(), () => {
                updateVulnDiagnotics();
                vscode.window.showInformationMessage(`Horusec: Analysis finished with success!`);
            });
        }

        stopLoading();
    });
}

function updateVulnDiagnotics() {
    try {
        vulnDiagnostics.clear();
        const analysis = parseOutputToAnalysis();

        vulnsProvider.insertVulnerabilities(parseAnalysisToVulnerabilities(analysis));

        subscribeToDocumentChanges(
            vulnDiagnostics,
            analysis
        );
    } catch (error) {
        console.log(error);
    }
}

function getStartCommand(): string {
    const dockerSock = `-v /var/run/docker.sock:/var/run/docker.sock`;
    const startCommandUUID = uuidv4();
    const analysisFolder = `/src/horusec-vscode-${startCommandUUID}`;
    const bindVolume = `-v ${vscode.workspace.rootPath}:${analysisFolder}`;
    const cliImage = `horuszup/horusec-cli:v1.6.0-alpha-1`;
    const horusecJsonOutput = `-o json -O ${analysisFolder}/horusec-result.json`;
    const horusecStart = `horusec start -p ${analysisFolder} -P ${vscode.workspace.rootPath} ${horusecJsonOutput}`;

    return `docker run ${dockerSock} ${bindVolume} --name ${containerName} ${cliImage} ${horusecStart}`;
}

function getRemoveContainerCommand(): string {
    return `docker rm ${containerName} -f`;
}

function startLoading(): void {
    isLoading = true;
    statusLoading.show();
}

function stopLoading(): void {
    statusLoading.hide();
    isLoading = false;
}

export function deactivate() { }
