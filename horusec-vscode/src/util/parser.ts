import * as vscode from 'vscode';
import * as fs from 'fs';
import { Analysis, Vulnerability } from '../entities/vulnerability';

const horusecResultPath = `${vscode.workspace.rootPath}/horusec-result.json`;

export function parseOutputToAnalysis(): Analysis {
    try {
        let data = fs.readFileSync(horusecResultPath);
        fs.unlinkSync(horusecResultPath);
        return JSON.parse(data.toString());
    } catch (error) {
        console.log(error);
        return {} as Analysis;
    }
}

export function parseAnalysisToVulnerabilities(analysis: Analysis): Vulnerability[] {
    let vulnerabilities: Vulnerability[] = [];
    analysis.analysisVulnerabilities.forEach((av) => {
        vulnerabilities.push(av.vulnerabilities);
    });
    return vulnerabilities;
}
