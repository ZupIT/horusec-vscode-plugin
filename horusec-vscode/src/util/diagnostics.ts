import * as vscode from 'vscode';
import * as path from 'path';

import { Vulnerability } from '../entities/vulnerability';

/**
 * Update diagnotics with found vulnerabilities in that file
 * @param document vscode text document
 * @param vulnDiagnostics vulnerabilities diagnotics
 * @param vulnerabilities vulnerabilities found in horusec analysis
 */
function refreshDiagnostics(document: vscode.TextDocument,
    vulnDiagnostics: vscode.DiagnosticCollection, vulnerabilities: Vulnerability[]): void {
    const diagnostics: vscode.Diagnostic[] = [];
    vulnerabilities.forEach(vulnerability => {
        if (document && path.basename(document.uri.fsPath) === getFilename(vulnerability.file)) {
            diagnostics.push(createDiagnostic(document, vulnerability));
        }
    });

    vulnDiagnostics.set(document.uri, diagnostics);
}

/**
 * Create warn diagnotic from vulnerability data
 * @param document vscode text document
 * @param vulnerability horusec vulnerability
 */
function createDiagnostic(document: vscode.TextDocument, vulnerability: Vulnerability): vscode.Diagnostic {
    let diagnostic = new vscode.Diagnostic(
        createDiagnosticRange(document, Number(vulnerability.line)),
        vulnerability.referenceHash,
        vscode.DiagnosticSeverity.Warning
    );

    return setDiagnosticData(document, diagnostic, vulnerability);
}

/**
 * Set diagnotic general diagnostic data from vulnerability data
 * @param document vscode text document
 * @param diagnostic vscode diagnostic
 * @param vulnerability horusec vulnerability
 */
function setDiagnosticData(document: vscode.TextDocument, diagnostic: vscode.Diagnostic,
    vulnerability: Vulnerability): vscode.Diagnostic {
    diagnostic.relatedInformation = setDiagnosticRelatedInformation(document, vulnerability);
    diagnostic.code = vulnerability.severity;
    diagnostic.source = vulnerability.code;
    return diagnostic;
}

/**
 * Create diagnotic detalied information
 * @param document vscode text document
 * @param vulnerability horusec vulnerability
 */
function setDiagnosticRelatedInformation(document: vscode.TextDocument,
    vulnerability: Vulnerability): vscode.DiagnosticRelatedInformation[] {
    return [new vscode.DiagnosticRelatedInformation(
        createDiagnosticLocation(document, Number(vulnerability.line)),
        getDetails(vulnerability.details)
    )];
}

/**
 * Create diagnotic of vulnerability range
 * @param document vscode text document
 * @param line vulnerability line
 */
function createDiagnosticRange(document: vscode.TextDocument,
    line: number): vscode.Range {
    var lineRange = document.lineAt(line - 1).range;

    return new vscode.Range(
        createDiagnosticPosition(lineRange.start.character, line),
        createDiagnosticPosition(lineRange.end.character, line)
    );
}

/**
 * Create diagnotic of vulnerability location
 * @param document vscode text document
 * @param line vulnerability line
 */
function createDiagnosticLocation(document: vscode.TextDocument,
    line: number): vscode.Location {
    return new vscode.Location(
        document.uri,
        createDiagnosticRange(document, line)
    );
}

/**
 * Create diagnotics o vulnerability position
 * @param character character position in the line
 * @param line vulnerability line
 */
function createDiagnosticPosition(character: number,
    line: number): vscode.Position {
    return new vscode.Position(
        line - 1,
        character
    );
}

/**
 * Send diagnotics changes when one of listed actions happens
 * @param vulnDiagnostics vulnerabilities diagnotics
 * @param vulnerabilities vulnerabilities found in horusec analysis
 */
export function subscribeToDocumentChanges(vulnDiagnostics: vscode.DiagnosticCollection,
    vulnerabilities: Vulnerability[]): void {
    vulnerabilities.forEach(vulnerability => {
        vscode.workspace.openTextDocument('./' + vulnerability.file).then(document => {
            refreshDiagnostics(
                document,
                vulnDiagnostics,
                vulnerabilities
            );
        });
    });
}

/**
 * Get filename from filepath
 * @param filePath vulnerability filepath
 */
function getFilename(filePath: string): string {
    return filePath.replace(/^.*[\\\/]/, '');
}

/**
 * Validates if details are empty
 * If empty returns -, if no return the details
 * Empty diagnotics messages are not allowed
 * @param details vulnerability details
 */
function getDetails(details: string): string {
    if (details === '') {
        return '-';
    }

    return details;
}
