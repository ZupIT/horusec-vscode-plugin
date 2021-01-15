import { exec } from 'child_process';
import { getRemoveContainerCommand } from '../util/docker';
import * as vscode from 'vscode';
import { stopLoading } from '../util/loading';

function stopHorusec() {
    exec(getRemoveContainerCommand(), (error: any) => {
      if (error && !error.stack.includes('No such container: horusec-cli')) {
        vscode.window.showErrorMessage(`Horusec stop failed: ${error.message}`);
      }

      stopLoading();
    });
}

export {
  stopHorusec
};
