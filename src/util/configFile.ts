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
import { HorusecConfigFile } from '../entities/horusecConfig';

const writeInConfigFile = (key: string, value: any) => {
  const wsedit = new vscode.WorkspaceEdit();
  const wsPath = vscode?.workspace?.workspaceFolders[0].uri.fsPath;
  const fileName = '/horusec-config.json';
  const filePathString = wsPath + fileName;
  const filePathVSCode = vscode.Uri.file(filePathString);
  const filePathToOpen = path.join(wsPath, fileName);

  if (!fs.existsSync(filePathString)) {
    wsedit.createFile(filePathVSCode);
    fs.writeFileSync(filePathToOpen, JSON.stringify({}, null, 2));
    vscode.workspace.applyEdit(wsedit);
    vscode.window.showInformationMessage(
      'The horusec-config.json settings file was created at the root of the current workspace.'
    );
  }

  const buf = fs.readFileSync(filePathString);
  let currentDataInFile: HorusecConfigFile = JSON.parse(buf.toString());

  if (currentDataInFile) {
    currentDataInFile = Object.assign(currentDataInFile, { [key]: value });
    fs.writeFileSync(
      filePathToOpen,
      JSON.stringify(currentDataInFile, null, 2)
    );
  } else {
    fs.writeFileSync(filePathToOpen, JSON.stringify({ [key]: value }, null, 2));
  }

  vscode.workspace.applyEdit(wsedit);
  vscode.window.showInformationMessage(
    `The ${key} flag was added to the settings file: horusec-config.json`
  );
};

export { writeInConfigFile };
