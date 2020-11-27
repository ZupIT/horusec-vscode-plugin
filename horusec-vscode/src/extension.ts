import * as vscode from 'vscode';
import { exec } from 'child_process';
import { subscribeToDocumentChanges } from './diagnostics';
import { parseStdoutToVulnerabilities, removeCertMessages } from './parser';

const vulnerabilitiesDiagnostics = vscode.languages.createDiagnosticCollection("vulnerabilities");
const horusecStartCommand = `docker run --privileged -v ${vscode.workspace.rootPath}:/horusec horuszup/horusec-cli:v1.5.0 -p /horusec`;

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('horusec.start', function () {
		vscode.window.showInformationMessage(`Hold on! Horusec started to analysis your code.`);
		installAndRunHorusec(context);
	});

	context.subscriptions.push(vulnerabilitiesDiagnostics);
}

function installAndRunHorusec(context: vscode.ExtensionContext) {
	if (vscode.workspace.rootPath === undefined) {
		vscode.window.showErrorMessage('No valid workspace found.');
		return;
	}

	exec(horusecStartCommand, (error: any, stdout: any) => {
		if (error) {
			vscode.window.showErrorMessage(`Horusec analysis failed: ${error.message}`);
			console.log('error', error);
			return;
		}

		printAndUpdateByResult(context, removeCertMessages(stdout));
	});
}

function printAndUpdateByResult(context: vscode.ExtensionContext, stdout: string) {
	try {
		updateVulnDiagnotics(context, stdout);

		vscode.workspace.openTextDocument({
			language: 'text',
			content: stdout
		}).then(doc => {
			vscode.window.showTextDocument(doc);
		});

		vscode.window.showInformationMessage(`Analysis finished with success!`);
	} catch (error) {
		console.log(error);
	}
}

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

export function deactivate() { }
