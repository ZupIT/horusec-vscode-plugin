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

  startLoading('stop');

  exec(getRemoveContainerCommand(), (error: any) => {
    if (error && !error.stack.includes('No such container: horusec-cli')) {
      vscode.window.showErrorMessage(`Horusec stop failed: ${error.message}`);
    }

    stopLoading('start');
    stopLoading('stop');
  });
}

export { stopHorusec };
