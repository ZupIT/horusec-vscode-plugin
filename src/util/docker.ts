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

import { platform } from 'os';
import * as vscode from 'vscode';

const cliImage = 'horuszup/horusec-cli:v2.3.0';
const containerName = 'horusec-cli';

export function getStartCommand(): string {
  const platformContent = platform();
  switch (platformContent) {
    case 'win32':
      return getStartCommandWindows();
    default:
      return getStartCommandDefault();
  }
}

export function getRemoveContainerCommand(): string {
  return `docker rm ${containerName} -f`;
}

function getStartCommandWindows() {
  const rootPath = getSourceFolderFromWindows(vscode.workspace.rootPath);
  const dockerSock = `-v //var/run/docker.sock:/var/run/docker.sock`;
  const analysisFolder = `/src/horusec-vscode`;
  const bindVolume = `-v ${rootPath}:${analysisFolder}`;
  const outputJsonPath = `${analysisFolder}/horusec-result.json`;
  const horusecJsonOutput = `-o json -O ${outputJsonPath}`;
  const configFilePath = `--config-file-path ${analysisFolder}/horusec-config.json`;
  const infoEnable = `-I true`;
  const horusecStart = `horusec start -p ${analysisFolder} -P ${rootPath} ${horusecJsonOutput} ${configFilePath} ${infoEnable}`;

  return `docker run ${dockerSock} ${bindVolume} --name ${containerName} ${cliImage} ${horusecStart}`;
}

function getStartCommandDefault() {
  const rootPath = vscode.workspace.rootPath;
  const dockerSock = `-v /var/run/docker.sock:/var/run/docker.sock`;
  const analysisFolder = `/src/horusec-vscode`;
  const bindVolume = `-v ${rootPath}:${analysisFolder}`;
  const outputJsonPath = `${analysisFolder}/horusec-result.json`;
  const horusecJsonOutput = `-o json -O ${outputJsonPath}`;
  const configFilePath = `--config-file-path ${analysisFolder}/horusec-config.json`;
  const infoEnable = `-I true`;
  const horusecStart = `horusec start -p ${analysisFolder} -P ${rootPath} ${horusecJsonOutput} ${configFilePath} ${infoEnable}`;

  return `docker run ${dockerSock} ${bindVolume} --name ${containerName} ${cliImage} ${horusecStart}`;
}

function getSourceFolderFromWindows(path = ''): string {
  let partitionLower = path.toLowerCase().substring(0, 1);
  let pathSplit = path.split(':');
  pathSplit[0] = partitionLower;
  path = pathSplit.join('');
  path = '//' + path;
  path = path.split('\\').join('//');
  return path;
}
