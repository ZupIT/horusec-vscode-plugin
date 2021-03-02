import { exec } from 'child_process';
import { getRemoveContainerCommand } from '../util/docker';
import * as vscode from 'vscode';
import { stopLoading, isLoading, startLoading } from '../util/loading';


function stopHorusec() {
  if (isLoading('stop')) {
    vscode.window.showWarningMessage('Hold on! Horusec is stopping your analysis.');
    return;
  }
  if (!isLoading('start')) {
    vscode.window.showWarningMessage('Horusec is not running to stop analysis.');
    return;
  }

  startLoading('stop')

  exec(getRemoveContainerCommand(), (error: any) => {
    if (error && !error.stack.includes('No such container: horusec-cli')) {
      vscode.window.showErrorMessage(`Horusec stop failed: ${error.message}`);
    }

    stopLoading('start');
    stopLoading('stop');
  });
}

export {
  stopHorusec
};
