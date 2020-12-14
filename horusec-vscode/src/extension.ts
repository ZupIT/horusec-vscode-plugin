import * as vscode from 'vscode';
import { exec } from 'child_process';
import { platform } from 'os';
import { subscribeToDocumentChanges } from './util/diagnostics';
import { TreeProvider } from './providers/tree';
import { HelpProvider } from './providers/help';
import { parseOutputToAnalysis, parseAnalysisToVulnerabilities } from './util/parser';

let isLoading: boolean;
let vulnsProvider: TreeProvider;
let helpProvider: HelpProvider;
let horusecView: vscode.Disposable;
const containerName = 'horusec-cli';
const vulnDiagnostics = vscode.languages.createDiagnosticCollection('vulnerabilities');
const statusLoading = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
statusLoading.text = '$(sync~spin) Horusec: Security analysis running';
statusLoading.tooltip = 'Hold on! Horusec is analyzing your code.';

export function activate(context: vscode.ExtensionContext) {
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
    context.subscriptions.push(vscode.workspace.createFileSystemWatcher('**/*.*').onDidDelete(uri => {
        vulnDiagnostics.delete(uri);
    }));


    helpProvider = new HelpProvider(context);
    vscode.window.registerTreeDataProvider('helpView', helpProvider);
    context.subscriptions.push(vscode.commands.registerCommand('horusec.openLink', async (e) => helpProvider.openLink(e)));
}

function stopHorusec() {
    if (!isLoading) {
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
        vscode.window.showWarningMessage('Hold on! Horusec is analyzing his code.');
        return;
    }

    vscode.window.showInformationMessage(`Hold on! Horusec started to analysis your code.`);
    execStartCommand();
}

function execStopCommand() {
    exec(getRemoveContainerCommand(), (error: any) => {
        if (error && !error.stack.includes('No such container: horusec-cli')) {
            vscode.window.showErrorMessage(`Horusec stop failed: ${error.message}`);
            console.log('error', error);
        }

        stopLoading();
    });
}

function execStartCommand() {
    startLoading();
    vulnsProvider.resetTree();
    exec(getStartCommand(), (error: any) => {
        setTimeout(() => {
            if (error) {
                if (!isLoading && error.stack.includes('ChildProcess.exithandler')) {
                    vscode.window.showWarningMessage('Horusec was forced to stop');
                } else {
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
        }, 300);
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

/*
docker run -v //var/run/docker.sock:/var/run/docker.sock \
-v //c//Users//wilia//Documents//Horus//horus-example-vulnerabilities:/src/horusec-vscode \
horuszup/horusec-cli:v1.6.0-alpha-1 \
horusec start -p /src/horusec-vscode -P //c//Users//wilia//Documents//Horus//horus-example-vulnerabilities \
--log-level debug -o json -O /src/horusec-vscode/output.json
*/
function getStartCommand(): string {
    const platformContent = platform();
    switch (platformContent) {
        case 'win32':
            return getStartCommandWindows();
        default:
            return getStartCommandDefault();
    }
}

function getStartCommandWindows() {
    const rootPath = getSourceFolderFromWindows(vscode.workspace.rootPath);
    const dockerSock = `-v //var/run/docker.sock:/var/run/docker.sock`;
    const analysisFolder = `/src/horusec-vscode`;
    const bindVolume = `-v ${rootPath}:${analysisFolder}`;
    const cliImage = `horuszup/horusec-cli:v1.6.0-alpha-1`;
    const outputJsonPath = `${analysisFolder}/horusec-result.json`;
    const horusecJsonOutput = `-o json -O ${outputJsonPath}`;
    const horusecStart = `horusec start -p ${analysisFolder} -P ${rootPath} ${horusecJsonOutput}`;

    return `docker run ${dockerSock} ${bindVolume} --name ${containerName} ${cliImage} ${horusecStart}`;
}

function getStartCommandDefault() {
    const rootPath = vscode.workspace.rootPath;
    const dockerSock = `-v /var/run/docker.sock:/var/run/docker.sock`;
    const analysisFolder = `/src/horusec-vscode`;
    const bindVolume = `-v ${rootPath}:${analysisFolder}`;
    const cliImage = `horuszup/horusec-cli:v1.6.1`;
    const outputJsonPath = `${analysisFolder}/horusec-result.json`;
    const horusecJsonOutput = `-o json -O ${outputJsonPath}`;
    const horusecStart = `horusec start -p ${analysisFolder} -P ${rootPath} ${horusecJsonOutput}`;

    return `docker run ${dockerSock} ${bindVolume} --name ${containerName} ${cliImage} ${horusecStart} && echo 'xablau'`;
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

function getSourceFolderFromWindows(path=''): string {
	let partitionLower = path.toLowerCase().substring(0, 1);
	let pathSplit = path.split(':');
	pathSplit[0] = partitionLower;
	path = pathSplit.join('');
	path = '//' + path;
    path = path.split('\\').join('//');
	return path;
}
export function deactivate() { }
