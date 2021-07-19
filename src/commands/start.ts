/**
 * Copyright 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';
import { getRemoveContainerCommand, getStartCommand } from '../util/docker';
import { exec } from 'child_process';
import { startLoading, stopLoading, isLoading } from '../util/loading';
import { vulnDiagnostics, vulnsProvider } from '../extension';
import { updateVulnDiagnotics } from '../util/diagnostics';

let totalRestartHorusec = 0;

function startHorusec() {
  if (vscode.workspace.rootPath === undefined) {
    vscode.window.showErrorMessage('Horusec: No valid workspace found.');
    return;
  }
  if (isLoading('start')) {
    vscode.window.showWarningMessage('Hold on! Horusec is analyzing his code.');
    return;
  }

  vscode.window.showInformationMessage(`Hold on! Horusec started to analysis your code.`);
  execStartCommand();
}

function execStartCommand() {
  startLoading('start');
  vulnsProvider.resetTree();
  vulnDiagnostics.clear();
  exec(getStartCommand(), (error: any) => {
    setTimeout(() => {
      if (proccessFinishedWithSuccess(error) || proccessExitedBecauseFondVulnerabilities(error)) {
        finishStartCommand('success');
        return;
      }

      if (proccessWasForcedToStop(error)) {
        vscode.window.showWarningMessage('Horusec was forced to stop');
        return;
      }

      if (proccessExitedBecauseAlreadyExistHorusecCliContainer(error)) {
        totalRestartHorusec++;
        if (totalRestartHorusec > 3) {
          finishStartCommand('error', error.message);
          return;
        }
        finishStartCommand('retry');
        return;
      }

      finishStartCommand('error', error.message);
      return;
    }, 300);
  });
}

function proccessFinishedWithSuccess(error: any): boolean {
  return !error;
}

function proccessWasForcedToStop(error: any): boolean {
  return !isLoading('start') && error && error.stack.includes('ChildProcess.exithandler');
}

function proccessExitedBecauseFondVulnerabilities(error: any): boolean {
  return error && error.stack.includes('Error: analysis finished with blocking vulnerabilities');
}

function proccessExitedBecauseAlreadyExistHorusecCliContainer(error: any): boolean {
  return error && error.stack.includes('Conflict. The container name \"/horusec-cli\" is already in use');
}

function finishStartCommand(type: 'success'|'error'|'retry', err: any = ''): void {
  exec(getRemoveContainerCommand(), () => {
    if (type === 'success') {
      updateVulnDiagnotics();
      vscode.window.showInformationMessage(`Horusec: Analysis finished with success!`);
      stopLoading('start');
    } else if (type === 'error') {
      vscode.window.showErrorMessage(`Horusec analysis failed: ${err}`);
      stopLoading('start');
    } else if (type === 'retry') {
      stopLoading('start');
      startHorusec();
    }
    stopLoading('stop');
  });
}

export {
  startHorusec
};
