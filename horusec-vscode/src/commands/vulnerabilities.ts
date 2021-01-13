import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { TreeItem } from '../providers/tree';
import { HorusecConfigFile } from '../entities/horusecConfig';
import { vulnsProvider, vulnDiagnostics } from '../extension';
import { removeDiagnostic } from '../util/diagnostics';


function setAsFalsePositive(treeItem: TreeItem) {
  writeHashInFile(treeItem.vulnHash, 'falsePositive');
}

function setAsRiskAccept(treeItem: TreeItem) {
  writeHashInFile(treeItem.vulnHash, 'riskAccept');
}

function writeHashInFile(vulnHash: string, type: 'riskAccept' | 'falsePositive') {
  const wsedit = new vscode.WorkspaceEdit();
  const wsPath = vscode?.workspace?.workspaceFolders[0].uri.fsPath;
  const fileName = '/horusec-config.json';
  const filePathString = wsPath + fileName;
  const filePathVSCode = vscode.Uri.file(filePathString);
  const filePathToOpen = path.join(wsPath, fileName);

  let fileContent: HorusecConfigFile = {
    horusecCliFalsePositiveHashes: [],
    horusecCliRiskAcceptHashes: []
  };

  if (fs.existsSync(filePathString)) {
    fs.readFile(filePathString, (_, data: any) => {
      let horusecConfigData: HorusecConfigFile = JSON.parse(data);

      fileContent = {
        ...horusecConfigData
      };

      if (type === 'falsePositive') {
        fileContent.horusecCliFalsePositiveHashes.push(vulnHash);
      } else if (type === 'riskAccept') {
        fileContent.horusecCliRiskAcceptHashes.push(vulnHash);
      }

      fs.writeFileSync(filePathToOpen, JSON.stringify(fileContent));
      vscode.workspace.applyEdit(wsedit);
    });
  } else {
    wsedit.createFile(filePathVSCode, { ignoreIfExists: true });

    if (type === 'falsePositive') {
      fileContent.horusecCliFalsePositiveHashes.push(vulnHash);
    } else if (type === 'riskAccept') {
      fileContent.horusecCliRiskAcceptHashes.push(vulnHash);
    }

    fs.writeFileSync(filePathToOpen, JSON.stringify(fileContent));
    vscode.workspace.applyEdit(wsedit);
  }

  vulnsProvider.removeChildren(vulnHash);
  removeDiagnostic(vulnHash);
}

export {
  setAsFalsePositive,
  setAsRiskAccept
};
