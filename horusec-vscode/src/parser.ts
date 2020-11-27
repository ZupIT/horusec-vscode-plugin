import { Vulnerability } from './entities';

const separator = '==================================================================================';

export function parseStdoutToVulnerabilities(stdout: string): Vulnerability[] {
    try {
        let splitedOutput = stdout.split(separator);
        let jsonArrayString = '';

        splitedOutput.forEach(outputSplited => {
            jsonArrayString = parseToJson(outputSplited, jsonArrayString);
        });

        return JSON.parse(addArrayBracket(jsonArrayString));
    } catch (error) {
        console.log(error);
        return [];
    }
}

function addArrayBracket(jsonArrayString: string): string {
    jsonArrayString = '[' + jsonArrayString + ']';
    jsonArrayString = jsonArrayString.split('{},').join('');
    return jsonArrayString.split('},]').join('}]');
}

function parseToJson(outputSplited: string, jsonArrayString: string): string {
    let vulnJson = '';

    if (outputSplited.includes('ReferenceHash:')) {
        let outputSplitedByField = removeInvalidOutputs(outputSplited).split('\n');
        outputSplitedByField.forEach(splitedField => {
            if (splitedField !== '') {
                vulnJson = formatField(splitedField, vulnJson);
            }
        });
    }

    if (checkValidStringJson('{' + vulnJson + '}')) {
        jsonArrayString = jsonArrayString + '{' + vulnJson + '},';
    }

    return jsonArrayString;
}

function formatField(splitedField: string, vulnJson: string): string {
    let jsonField = getJsonField(splitedField);
    return vulnJson + jsonField;
}

function getJsonField(splitedOutputField: string): string {
    let jsonField = '';

    if (splitedOutputField.includes('ReferenceHash:')) {
        jsonField = JSON.stringify(splitedOutputField);
    } else {
        jsonField = JSON.stringify(splitedOutputField);
        jsonField = jsonField + ',';
    }

    jsonField = toLowerCase(jsonField);
    jsonField = removeWhiteSpace(jsonField);
    return jsonField.replace(':', '":"');
}

function toLowerCase(jsonField: string): string {
    return jsonField.replace(
        jsonField.charAt(1).valueOf(),
        jsonField.charAt(1).valueOf().toLowerCase()
    );
}

function removeWhiteSpace(jsonField: string): string {
    let index = jsonField.indexOf(':');
    jsonField = jsonField.replace(jsonField.charAt(index + 1).valueOf(), '');
    return jsonField;
}

function removeInvalidOutputs(outputSplited: string): string {
    outputSplited = removeDetailsLineBreakDetails(outputSplited);
    outputSplited = removeDetailsLineBreakCode(outputSplited);
    outputSplited = removeQuotationMarksCode(outputSplited);
    return outputSplited;
}

function removeDetailsLineBreakDetails(outputSplited: string): string {
    let indexDetails = outputSplited.indexOf('Details:');
    let indexType = outputSplited.indexOf('Type:');
    let detailsOriginal = outputSplited.slice(indexDetails, indexType - 2);
    let detailsFormated = detailsOriginal.split('\n').join(' ');
    let detailsInfo = detailsFormated.slice(detailsFormated.indexOf('Details:') + 8, detailsFormated.length);
    let detailsFinal = 'details: ' + detailsInfo.split(':').join('');
    return outputSplited.split(detailsOriginal).join(detailsFinal);
}

function removeDetailsLineBreakCode(outputSplited: string): string {
    let indexDetails = outputSplited.indexOf('details:');
    let indexCode = outputSplited.indexOf('Code:');
    let codeOriginal = outputSplited.slice(indexCode, indexDetails - 2);
    let detailsFormated = codeOriginal.split('\n').join(' ');
    return outputSplited.split(codeOriginal).join(detailsFormated);
}

function removeQuotationMarksCode(outputSplited: string): string {
    let indexDetails = outputSplited.indexOf('details:');
    let indexCode = outputSplited.indexOf('Code:');
    let codeOriginal = outputSplited.slice(indexCode, indexDetails - 2);
    let detailsWithoutMarks = codeOriginal.split('`').join('');
    let detailsFormated = detailsWithoutMarks.split('"').join('');
    return outputSplited.split(codeOriginal).join(detailsFormated);
}

export function removeCertMessages(output: string): string {
    output = output.split('/certs/server/cert.pem: OK').join('');
    output = output.split('/certs/client/cert.pem: OK').join('');
    return output;
}

function checkValidStringJson(vulnJson: string): boolean {
    try {
        JSON.parse(vulnJson);
    } catch {
        return false;
    }

    return true;
}
