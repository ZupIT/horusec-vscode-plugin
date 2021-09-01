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
    horusecCliRiskAcceptHashes: [],
  };

  if (fs.existsSync(filePathString)) {
    fs.readFile(filePathString, (_, data: any) => {
      let horusecConfigData: HorusecConfigFile = JSON.parse(data);

      fileContent = {
        ...horusecConfigData,
      };

      if (type === 'falsePositive') {
        fileContent.horusecCliFalsePositiveHashes.push(vulnHash);
      } else if (type === 'riskAccept') {
        fileContent.horusecCliRiskAcceptHashes.push(vulnHash);
      }

      fs.writeFileSync(filePathToOpen, JSON.stringify(fileContent, null, 2));
      vscode.workspace.applyEdit(wsedit);
    });
  } else {
    wsedit.createFile(filePathVSCode, { ignoreIfExists: true });

    if (type === 'falsePositive') {
      fileContent.horusecCliFalsePositiveHashes.push(vulnHash);
    } else if (type === 'riskAccept') {
      fileContent.horusecCliRiskAcceptHashes.push(vulnHash);
    }

    fs.writeFileSync(filePathToOpen, JSON.stringify(fileContent, null, 2));
    vscode.workspace.applyEdit(wsedit);
  }

  vulnsProvider.removeChildren(vulnHash);
  removeDiagnostic(vulnHash);
}

export { setAsFalsePositive, setAsRiskAccept };
