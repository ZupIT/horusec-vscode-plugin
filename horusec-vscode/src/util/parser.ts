import { Vulnerability } from '../entities/vulnerability';

//Used to split output in vulnerability
const separator = '==================================================================================';

/**
 * Parse stdout string into a array of vulnerabilities
 * @param stdout horusec analysis result
 */
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

/**
 * Remove empty jsons and add brackets
 * @param jsonArrayString parsed string of vulnerabilities array
 */
function addArrayBracket(jsonArrayString: string): string {
    jsonArrayString = '[' + jsonArrayString + ']';
    jsonArrayString = jsonArrayString.split('{},').join('');
    return jsonArrayString.split('},]').join('}]');
}

/**
 * Split json output into fields to format into json valid fields
 * @param outputSplited output vuln 
 * @param jsonArrayString vulnerabilities array after parse
 */
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

/**
 * Joins parsed field with the entire json
 * @param splitedField vuln json field
 * @param vulnJson entire json string
 */
function formatField(splitedField: string, vulnJson: string): string {
    let jsonField = getJsonField(splitedField);
    return vulnJson + jsonField;
}

/**
 * Validate if is a valid output
 * Parse field to json valid format
 * @param splitedOutputField vuln json field
 */
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

/**
 * Set json field key to lower case
 * @param jsonField vuln json field
 */
function toLowerCase(jsonField: string): string {
    return jsonField.replace(
        jsonField.charAt(1).valueOf(),
        jsonField.charAt(1).valueOf().toLowerCase()
    );
}

/**
 * Remove extra white space from each json field
 * @param jsonField vuln json field
 */
function removeWhiteSpace(jsonField: string): string {
    let index = jsonField.indexOf(':');
    jsonField = jsonField.replace(jsonField.charAt(index + 1).valueOf(), '');
    return jsonField;
}

/**
 * Remove some characters that may break json parse
 * @param outputSplited stdout splited vulnerability
 */
function removeInvalidOutputs(outputSplited: string): string {
    outputSplited = removeDetailsLineBreakDetails(outputSplited);
    outputSplited = removeDetailsLineBreakCode(outputSplited);
    outputSplited = removeQuotationMarksCode(outputSplited);
    return outputSplited;
}

/**
 * Remove line breaks from details json field to avoid break json parse
 * @param outputSplited stdout splited vulnerability
 */
function removeDetailsLineBreakDetails(outputSplited: string): string {
    let indexDetails = outputSplited.indexOf('Details:');
    let indexType = outputSplited.indexOf('Type:');
    let detailsOriginal = outputSplited.slice(indexDetails, indexType - 2);
    let detailsFormated = detailsOriginal.split('\n').join(' ');
    let detailsInfo = detailsFormated.slice(detailsFormated.indexOf('Details:') + 8, detailsFormated.length);
    let detailsFinal = 'details: ' + detailsInfo.split(':').join('');
    return outputSplited.split(detailsOriginal).join(detailsFinal);
}

/**
 * Remove line breaks from code json field to avoid break json parse
 * @param outputSplited stdout splited vulnerability
 */
function removeDetailsLineBreakCode(outputSplited: string): string {
    let indexDetails = outputSplited.indexOf('details:');
    let indexCode = outputSplited.indexOf('Code:');
    let codeOriginal = outputSplited.slice(indexCode, indexDetails - 2);
    let detailsFormated = codeOriginal.split('\n').join(' ');
    return outputSplited.split(codeOriginal).join(detailsFormated);
}

/**
 * Remove single and double quotation marks from code json field to avoid break json parse
 * @param outputSplited stdout splited vulnerability
 */
function removeQuotationMarksCode(outputSplited: string): string {
    let indexDetails = outputSplited.indexOf('details:');
    let indexCode = outputSplited.indexOf('Code:');
    let codeOriginal = outputSplited.slice(indexCode, indexDetails - 2);
    let detailsWithoutMarks = codeOriginal.split('`').join('');
    let detailsFormated = detailsWithoutMarks.split('"').join('');
    return outputSplited.split(codeOriginal).join(detailsFormated);
}

/**
 * Remove cert message from horusec container stdout
 * @param output container stdout
 */
export function removeCertMessages(output: string): string {
    output = output.split('/certs/server/cert.pem: OK').join('');
    output = output.split('/certs/client/cert.pem: OK').join('');
    return output;
}

/**
 * Validates if parsed string in a valid json
 * @param vulnJson parsed string json
 */
function checkValidStringJson(vulnJson: string): boolean {
    try {
        JSON.parse(vulnJson);
    } catch {
        return false;
    }

    return true;
}
