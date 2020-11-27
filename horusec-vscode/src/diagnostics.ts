import * as vscode from 'vscode';
import * as path from 'path';

import { Vulnerability } from './entities';

export function refreshDiagnostics(document: vscode.TextDocument,
    vulnerabilitiesDiagnostics: vscode.DiagnosticCollection, vulnerabilities: Vulnerability[]): void {
    const diagnostics: vscode.Diagnostic[] = [];
    vulnerabilities.forEach(vulnerability => {

        if (document && path.basename(document.uri.fsPath) === getFilename(vulnerability.file)) {
            diagnostics.push(createDiagnostic(document, vulnerability));
        }
    });

    vulnerabilitiesDiagnostics.set(document.uri, diagnostics);
}

function createDiagnostic(document: vscode.TextDocument, vulnerability: Vulnerability): vscode.Diagnostic {
    let diagnostic = new vscode.Diagnostic(
        createDiagnosticRange(document, vulnerability),
        vulnerability.referenceHash,
        vscode.DiagnosticSeverity.Warning
    );

    return setDiagnosticData(document, diagnostic, vulnerability);
}

function setDiagnosticData(document: vscode.TextDocument, diagnostic: vscode.Diagnostic,
    vulnerability: Vulnerability): vscode.Diagnostic {
    diagnostic.relatedInformation = setDiagnosticRelatedInformation(document, vulnerability);
    diagnostic.code = vulnerability.severity;
    diagnostic.source = vulnerability.code;
    return diagnostic;
}

function setDiagnosticRelatedInformation(document: vscode.TextDocument,
    vulnerability: Vulnerability): vscode.DiagnosticRelatedInformation[] {
    return [new vscode.DiagnosticRelatedInformation(
        createDiagnosticLocation(document, vulnerability),
        getDetails(vulnerability.details)
    )];
}

function createDiagnosticRange(document: vscode.TextDocument,
    vulnerability: Vulnerability): vscode.Range {
    var lineRange = document.lineAt(Number(vulnerability.line) - 1).range;

    return new vscode.Range(
        createDiagnosticPosition(lineRange.start.character, vulnerability),
        createDiagnosticPosition(lineRange.end.character, vulnerability)
    );
}

function createDiagnosticLocation(document: vscode.TextDocument,
    vulnerability: Vulnerability): vscode.Location {
    return new vscode.Location(
        document.uri,
        createDiagnosticRange(document, vulnerability)
    );
}

function createDiagnosticPosition(character: number,
    vulnerability: Vulnerability): vscode.Position {
    return new vscode.Position(
        Number(vulnerability.line) - 1,
        character
    );
}

export function subscribeToDocumentChanges(context: vscode.ExtensionContext,
    vulnDiagnostics: vscode.DiagnosticCollection, vulnerabilities: Vulnerability[]): void {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(
            vscode.window.activeTextEditor.document,
            vulnDiagnostics,
            vulnerabilities
        );
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                refreshDiagnostics(
                    editor.document,
                    vulnDiagnostics,
                    vulnerabilities
                );
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(e => {
            refreshDiagnostics(
                e.document,
                vulnDiagnostics,
                vulnerabilities
            );
        })
    );
}

function getFilename(filePath: string): string {
    return filePath.replace(/^.*[\\\/]/, '');
}

function getDetails(details: string): string {
    if (details === '') {
        return '-';
    }

    return details;
}
