import * as vscode from 'vscode';

import { Analysis, AnalysisVulnerability } from '../entities/vulnerability';

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
        getDetails(analysisVulnerability.vulnerabilities.details)
    )];
}

/**
 * Create diagnotic of vulnerability range
 * @param document vscode text document
 * @param line vulnerability line
 */
export function createDiagnosticRange(document: vscode.TextDocument,
    line: number): vscode.Range {
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

export function subscribeToDocumentChanges(vulnDiagnostics: vscode.DiagnosticCollection,
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

function getDetails(details: string): string {
    if (details === '') {
        return '-';
    }

    return details;
}

function getFilepath(filepath: string): string {
    return `${vscode.workspace.rootPath}/${filepath}`;
}
