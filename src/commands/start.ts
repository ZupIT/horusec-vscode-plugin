import * as vscode from 'vscode';
import { getRemoveContainerCommand, getStartCommand } from '../util/docker';
import { exec } from 'child_process';
import { startLoading, stopLoading, isLoading } from '../util/loading';
import { vulnDiagnostics, vulnsProvider } from '../extension';
import { updateVulnDiagnotics } from '../util/diagnostics';

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

function execStartCommand() {
  startLoading();
  vulnsProvider.resetTree();
  vulnDiagnostics.clear();
  exec(getStartCommand(), (error: any) => {
    setTimeout(() => {
      if (error) {
        if (!isLoading && error.stack.includes('ChildProcess.exithandler')) {
          vscode.window.showWarningMessage('Horusec was forced to stop');
        } else {
          vscode.window.showErrorMessage(`Horusec analysis failed: ${error.message}`);
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

export {
  startHorusec
};
