import * as vscode from 'vscode';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { subscribeToDocumentChanges } from './util/diagnostics';
import { parseStdoutToVulnerabilities, removeCertMessages } from './util/parser';
import { TreeNodeProvider } from './provider';

let provider: TreeNodeProvider;
let horusecView: vscode.TreeView<any>;
const vulnerabilitiesDiagnostics = vscode.languages.createDiagnosticCollection('vulnerabilities');

const statusLoading = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
statusLoading.text = 'Security analysis running';
statusLoading.tooltip = 'Hold on! Horusec started to analysis your code.';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vulnerabilitiesDiagnostics);
	context.subscriptions.push(statusLoading);

	setupHorusecView(context);

	context.subscriptions.push(vscode.commands.registerCommand('horusec.start',
		async () => runHorusec(context))
	);
}
/**
 * Setup horusec view initial content
 * @param context vscode extension context
 */
function setupHorusecView(context: vscode.ExtensionContext) {
	provider = new TreeNodeProvider(context, false);
	horusecView = vscode.window.createTreeView('horusec-view', { treeDataProvider: provider });
	horusecView.title = 'Horusec';
	horusecView.message = 'When Horusec performs an analysis of your code and finds vulnerabilities it will show them below!';
	context.subscriptions.push(provider);
	context.subscriptions.push(horusecView);
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
	statusLoading.show();
	const startCommandUUID = uuidv4();
	const analysisFolder = `/src/horusec-vscode-${startCommandUUID}`;
	const command = `docker run --privileged --rm -v ${vscode.workspace.rootPath}:${analysisFolder} horuszup/horusec-cli:v1.5.0 -p ${analysisFolder}`;

	exec(command, (error: any, stdout: any) => {
		if (error) {
			vscode.window.showErrorMessage(`Horusec analysis failed: ${error.message}`);
			console.log('error', error);
		} else {
			updateVulnDiagnotics(context, stdout);
			openFileWithResult(removeCertMessages(stdout));
			vscode.window.showInformationMessage(`Analysis finished with success!`);
		}
		statusLoading.hide();
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

// this method is called when your extension is deactivated
export function deactivate() { }
