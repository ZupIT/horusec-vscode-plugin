export interface Vulnerability {
	language: string;
	severity: string;
	line: string;
	column: string;
	securityTool: string;
	confidence: string;
	file: string;
	code: string;
	details: string;
	type: string;
	referenceHash: string;
}
