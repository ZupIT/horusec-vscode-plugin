import { platform } from 'os';
import * as vscode from 'vscode';

const cliImage = 'horuszup/horusec-cli:v1.7.0';
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
  return `docker rm $(docker ps -a | awk '{ print $1,$2 }' | grep horuszup | awk '{print $1 }') -f`;
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
