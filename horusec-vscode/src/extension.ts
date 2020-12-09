import * as vscode from 'vscode';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { subscribeToDocumentChanges } from './util/diagnostics';
import { parseStdoutToVulnerabilities, removeCertMessages } from './util/parser';

const vulnerabilitiesDiagnostics = vscode.languages.createDiagnosticCollection("vulnerabilities");

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vulnerabilitiesDiagnostics);

	context.subscriptions.push(vscode.commands.registerCommand('horusec.start',
		async () => runHorusec(context)));
}

/**
 * Validates workspace and show message that analysis has started
 * @param context vscode extension context
 */
function runHorusec(context: vscode.ExtensionContext) {
	if (vscode.workspace.rootPath === undefined) {
		vscode.window.showErrorMessage('No valid workspace found.');
		return;
	}

	vscode.window.showInformationMessage(`Hold on! Horusec started to analysis your code.`);
	execStartCommand(context);
}

/**
 * Execute horusec docker cli image start command in actual workspace
 * Show information message that analysis has finished
 * @param context vscode extension context
 */
function execStartCommand(context: vscode.ExtensionContext) {
	exec(getCommand(), (error: any, stdout: any) => {
		if (error) {
			vscode.window.showErrorMessage(`Horusec analysis failed: ${error.message}`);
			console.log('error', error);
			return;
		}

		updateVulnDiagnotics(context, stdout);
		openFileWithResult(removeCertMessages(stdout));
		vscode.window.showInformationMessage(`Analysis finished with success!`);
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
 * @param context vscode extension context
 */
function updateVulnDiagnotics(context: vscode.ExtensionContext, stdout: string) {
	try {
		vulnerabilitiesDiagnostics.clear();

		subscribeToDocumentChanges(
			context,
			vulnerabilitiesDiagnostics,
			parseStdoutToVulnerabilities(stdout)
		);
	} catch (error) {
		console.log(error);
	}
}

function getCommand(): string {
	const dockerSock = `-v /var/run/docker.sock:/var/run/docker.sock`
	const startCommandUUID = uuidv4();
	const analysisFolder = `/src/horusec-vscode-${startCommandUUID}`;
	const bindVolume = `-v ${vscode.workspace.rootPath}:${analysisFolder}`
	const cliImage = `horuszup/horusec-cli:v1.6.0`
	const horusecStart = `horusec start -p ${analysisFolder} -P ${vscode.workspace.rootPath}`

	return `docker run ${dockerSock} ${bindVolume} ${cliImage} ${horusecStart}`;
}

// this method is called when your extension is deactivated
export function deactivate() { }
