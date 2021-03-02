import { exec } from 'child_process';
import { getRemoveContainerCommand } from '../util/docker';
import * as vscode from 'vscode';
import { stopLoading, isLoading } from '../util/loading';

let isStoppingHorusecAnalysis = false;

function stopHorusec() {
  if (isStoppingHorusecAnalysis) {
    vscode.window.showWarningMessage('Hold on! Horusec is stopping your analysis.');
    return;
  }
  if (!isLoading) {
    vscode.window.showWarningMessage('Horusec is not running to stop analysis.');
    return;
  }
  isStoppingHorusecAnalysis = true
  exec(getRemoveContainerCommand(), (error: any) => {
    if (error && !error.stack.includes('No such container: horusec-cli')) {
      vscode.window.showErrorMessage(`Horusec stop failed: ${error.message}`);
    }

    stopLoading();
    isStoppingHorusecAnalysis = false
  });
}

export {
  stopHorusec
};
