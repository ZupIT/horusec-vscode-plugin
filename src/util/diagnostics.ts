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
import { Analysis, AnalysisVulnerability, Vulnerability } from '../entities/vulnerability';
import { vulnDiagnostics, vulnsProvider } from '../extension';
import { parseAnalysisToVulnerabilities, parseOutputToAnalysis } from './parser';

let lastAnalysis: Analysis = null;

function updateVulnDiagnotics(analysis?: Analysis) {
  try {
    vulnDiagnostics.clear();

    if (!analysis) {
      analysis = parseOutputToAnalysis();
    }

    lastAnalysis = analysis;

    const vulnerabilitiesFound: Vulnerability[] = parseAnalysisToVulnerabilities(analysis) || [];

    if (!vulnerabilitiesFound || vulnerabilitiesFound.length <= 0 ) {
      vscode.window.showInformationMessage('Awesome! Horusec did not identify any vulnerabilities in his code.');
    } else {
      vscode.window.showWarningMessage(`Horusec: ${vulnerabilitiesFound.length} vulnerabilities were found.`);
    }

    vulnsProvider.insertVulnerabilities(vulnerabilitiesFound);

    subscribeToDocumentChanges(
      vulnDiagnostics,
      analysis
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(`Horusec error: ${error.message}`);
  }
}

function refreshDiagnostics(document: vscode.TextDocument,
  vulnDiagnostics: vscode.DiagnosticCollection, analysisVulnerabilities: AnalysisVulnerability[]): void {
  const diagnostics: vscode.Diagnostic[] = [];

  analysisVulnerabilities.forEach(analysisVulnerability => {
    if (document && document.uri.fsPath === getFilepath(analysisVulnerability.vulnerabilities.file)) {
      diagnostics.push(createDiagnostic(document, analysisVulnerability));
    }
  });

  vulnDiagnostics.set(document.uri, diagnostics);
}

function removeDiagnostic(vulnHash: string) {
  lastAnalysis.analysisVulnerabilities = lastAnalysis.analysisVulnerabilities.filter((item) => item.vulnerabilities.vulnHash !== vulnHash);
  updateVulnDiagnotics(lastAnalysis);
}

function createDiagnostic(document: vscode.TextDocument, analysisVulnerability: AnalysisVulnerability): vscode.Diagnostic {
  let diagnostic = new vscode.Diagnostic(
    createDiagnosticRange(document, Number(analysisVulnerability.vulnerabilities.line)),
    analysisVulnerability.vulnerabilities.vulnHash,
    vscode.DiagnosticSeverity.Warning
  );

  return setDiagnosticData(document, diagnostic, analysisVulnerability);
}

function setDiagnosticData(document: vscode.TextDocument, diagnostic: vscode.Diagnostic,
  analysisVulnerability: AnalysisVulnerability): vscode.Diagnostic {
  diagnostic.relatedInformation = setDiagnosticRelatedInformation(document, analysisVulnerability);
  diagnostic.code = analysisVulnerability.vulnerabilities.severity;
  diagnostic.source = analysisVulnerability.vulnerabilities.code;
  return diagnostic;
}

function setDiagnosticRelatedInformation(document: vscode.TextDocument,
  analysisVulnerability: AnalysisVulnerability): vscode.DiagnosticRelatedInformation[] {
  return [new vscode.DiagnosticRelatedInformation(
    createDiagnosticLocation(document, Number(analysisVulnerability.vulnerabilities.line)),
    getDetails(analysisVulnerability.vulnerabilities)
  )];
}

/**
 * Create diagnotic of vulnerability range
 * @param document vscode text document
 * @param line vulnerability line
 */
function createDiagnosticRange(document: vscode.TextDocument,
  vulnLine: number): vscode.Range {
  var line = 1;
  if (vulnLine > 0) {
    line = vulnLine;
  }
  var lineRange = document.lineAt(line - 1).range;

  return new vscode.Range(
    createDiagnosticPosition(lineRange.start.character, line),
    createDiagnosticPosition(lineRange.end.character, line)
  );
}

function createDiagnosticLocation(document: vscode.TextDocument,
  line: number): vscode.Location {
  return new vscode.Location(
    document.uri,
    createDiagnosticRange(document, line)
  );
}

function createDiagnosticPosition(character: number,
  line: number): vscode.Position {
  return new vscode.Position(
    line - 1,
    character
  );
}

function subscribeToDocumentChanges(vulnDiagnostics: vscode.DiagnosticCollection,
  analysis: Analysis): void {
  analysis.analysisVulnerabilities.forEach(analysisVulnerability => {
    vscode.workspace.openTextDocument(getFilepath(analysisVulnerability.vulnerabilities.file)).then(document => {
      refreshDiagnostics(
        document,
        vulnDiagnostics,
        analysis.analysisVulnerabilities
      );
    });
  });
}

function getDetails(vulnerability: Vulnerability): string {
  const { details, language, securityTool } = vulnerability;

  if (details === '') {
    return '-';
  }

  return `${language} - ${securityTool} : ${details}`;
}

function getFilepath(filepath: string): string {
  return `${vscode.workspace.rootPath}/${filepath}`;
}

export {
  subscribeToDocumentChanges,
  createDiagnosticRange,
  removeDiagnostic,
  updateVulnDiagnotics,
};
