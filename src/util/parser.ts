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
import * as fs from 'fs';
import * as path from 'path';
import { Analysis, Vulnerability } from '../entities/vulnerability';

const horusecResultPath = path.join(vscode.workspace.rootPath || '', 'horusec-result.json');

export function parseOutputToAnalysis(): Analysis {
  try {
    let data = fs.readFileSync(horusecResultPath);
    fs.unlinkSync(horusecResultPath);
    return JSON.parse(data.toString());
  } catch (error) {
    return {} as Analysis;
  }
}

export function parseAnalysisToVulnerabilities(analysis: Analysis): Vulnerability[] {
  let vulnerabilities: Vulnerability[] = [];
  if (analysis.analysisVulnerabilities && analysis.analysisVulnerabilities.length >= 0) {
    analysis.analysisVulnerabilities.forEach((av) => {
      vulnerabilities.push(av.vulnerabilities);
    });
  }
  return vulnerabilities.filter((vul) => vul.type === 'Vulnerability');
}
