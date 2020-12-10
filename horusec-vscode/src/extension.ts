import * as vscode from 'vscode';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { subscribeToDocumentChanges } from './util/diagnostics';
import { parseOutputToAnalysis } from './util/parser';

const vulnDiagnostics = vscode.languages.createDiagnosticCollection("vulnerabilities");

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vulnDiagnostics);

	context.subscriptions.push(vscode.commands.registerCommand('horusec.start',
		async () => runHorusec()));

	context.subscriptions.push(vscode.workspace.createFileSystemWatcher('**/*.*').onDidDelete(uri => {
		vulnDiagnostics.delete(uri);
	}));
}

function runHorusec() {
	if (vscode.workspace.rootPath === undefined) {
		vscode.window.showErrorMessage('No valid workspace found.');
		return;
	}

	vscode.window.showInformationMessage(`Hold on! Horusec started to analysis your code.`);
	execStartCommand();
}

function execStartCommand() {
	exec(getCommand(), (error: any, stdout: any) => {
		if (error) {
			vscode.window.showErrorMessage(`Horusec analysis failed: ${error.message}`);
			console.log('error', error);
			return;
		}

		updateVulnDiagnotics();
		vscode.window.showInformationMessage(`Analysis finished with success!`);
	});
}

function updateVulnDiagnotics() {
	try {
		vulnDiagnostics.clear();

		subscribeToDocumentChanges(
			vulnDiagnostics,
			parseOutputToAnalysis()
		);
	} catch (error) {
		console.log(error);
	}
}

function getCommand(): string {
	const dockerSock = `-v /var/run/docker.sock:/var/run/docker.sock`;
	const startCommandUUID = uuidv4();
	const analysisFolder = `/src/horusec-vscode-${startCommandUUID}`;
	const bindVolume = `-v ${vscode.workspace.rootPath}:${analysisFolder}`;
	const cliImage = `horuszup/horusec-cli:v1.6.0-alpha-1`;
	const horusecJsonOutput = `-o json -O ${analysisFolder}/horusec-result.json`;
	const horusecStart = `horusec start -p ${analysisFolder} -P ${vscode.workspace.rootPath} ${horusecJsonOutput}`;

	return `docker run ${dockerSock} ${bindVolume} ${cliImage} ${horusecStart}`;
}

export function deactivate() { }
