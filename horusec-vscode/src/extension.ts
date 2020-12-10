import * as vscode from 'vscode';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { subscribeToDocumentChanges } from './util/diagnostics';
import { parseStdoutToVulnerabilities, removeCertMessages } from './util/parser';
import { TreeNodeProvider } from './provider';

let isLoading: boolean;
let provider: TreeNodeProvider;
let horusecView: vscode.Disposable;
const containerName = 'horusec-cli';
const vulnDiagnostics = vscode.languages.createDiagnosticCollection("vulnerabilities");
const statusLoading = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
statusLoading.text = '$(sync~spin) Horusec: Security analysis running';
statusLoading.tooltip = 'Hold on! Horusec is analyzing your code.';

export function activate(context: vscode.ExtensionContext) {
	provider = new TreeNodeProvider();
	horusecView = vscode.window.registerTreeDataProvider('horusec-view', provider);
	context.subscriptions.push(horusecView);
	context.subscriptions.push(vulnDiagnostics);
	context.subscriptions.push(statusLoading);

	context.subscriptions.push(vscode.commands.registerCommand('horusec.start',
		async () => startHorusec()));
		context.subscriptions.push(vscode.commands.registerCommand('horusec.stop',
			async () => stopHorusec()));
	context.subscriptions.push(vscode.commands.registerCommand('horusec.openFile',
		async (e) => provider.openFile(e)));

	context.subscriptions.push(vscode.workspace.createFileSystemWatcher('**/*.*').onDidDelete(uri => {
		vulnDiagnostics.delete(uri);
	}));
}

/**
 * Stop and remove container horusec
 */
function stopHorusec() {
	if (vscode.workspace.rootPath === undefined) {
		vscode.window.showErrorMessage('Horusec: No valid workspace found.');
		return;
	}

	execStopCommand();
}

/**
 * Validates workspace and show message that analysis has started
 */
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
	exec(getRemoveContainerCommand(), (error: any, stdout: any) => {
		if (error) {
			vscode.window.showErrorMessage(`Horusec stop failed: ${error.message}`);
			console.log('error', error);
		}

		stopLoading();
	});
}

/**
 * Execute horusec docker cli image start command in actual workspace
 * Show information message that analysis has finished
 */
function execStartCommand() {
	startLoading();
	provider.resetTree();
	exec(getStartCommand(), (error: any, stdout: any) => {
		if (error) {
			if (!error.stack.contains('at ChildProcess.exithandler')) {
				vscode.window.showErrorMessage(`Horusec analysis failed: ${error.message}`);
				console.log('error', error);
			}
		} else {
			exec(getRemoveContainerCommand(), () => {
				updateVulnDiagnotics(stdout);
				openFileWithResult(removeCertMessages(stdout));
				vscode.window.showInformationMessage(`Horusec: Analysis finished with success!`);
			});
		}

		stopLoading();
	});
}

/**
 * Open a file in vscode with the analysis results
 * @param stdout horusec cli container output
 */
function openFileWithResult(stdout: string) {
	try {
		vscode.workspace.openTextDocument({
			language: 'text',
			content: stdout
		}).then(doc => {
			vscode.window.showTextDocument(doc);
		});

	} catch (error) {
		console.log(error);
	}
}

/**
 * Update code diagnotics after parsing stdout to vulnerabilities
 * @param stdout horusec cli container output
 */
function updateVulnDiagnotics(stdout: string) {
	try {
		vulnDiagnostics.clear();
		const allVulnerabilities = parseStdoutToVulnerabilities(stdout);

		provider.insertVulnerabilities(allVulnerabilities);

		subscribeToDocumentChanges(
			vulnDiagnostics,
			allVulnerabilities
		);
	} catch (error) {
		console.log(error);
	}
}

/**
 * Command that will be execute horusec docker image of cli
 */
function getStartCommand(): string {
	const dockerSock = `-v /var/run/docker.sock:/var/run/docker.sock`;
	const startCommandUUID = uuidv4();
	const analysisFolder = `/src/horusec-vscode-${startCommandUUID}`;
	const bindVolume = `-v ${vscode.workspace.rootPath}:${analysisFolder}`;
	const cliImage = `horuszup/horusec-cli:v1.6.0-alpha-1`;
	const horusecStart = `horusec start -p ${analysisFolder} -P ${vscode.workspace.rootPath}`;

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

// this method is called when your extension is deactivated
export function deactivate() { }
