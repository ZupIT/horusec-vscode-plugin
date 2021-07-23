/* eslint-disable */
export interface HorusecConfigFile {
  horusecCliMonitorRetryInSeconds?: number;
  horusecCliPrintOutputType?: string;
  horusecCliJsonOutputFilepath?: string;
  horusecCliTypesOfVulnerabilitiesToIgnore?: string;
  horusecCliFilesOrPathsToIgnore?: string;
  horusecCliHorusecApiUri?: string;
  horusecCliTimeoutInSecondsRequest?: number;
  horusecCliTimeoutInSecondsAnalysis?: number;
  horusecCliRepositoryAuthorization?: string;
  horusecCliReturnErrorIfFoundVulnerability?: boolean;
  horusecCliProjectPath?: string;
  horusecCliCertInsecureSkipVerify?: boolean;
  horusecCliCertPath?: string;
  horusecCliFilterPath?: string;
  horusecCliEnableGitHistoryAnalysis?: boolean;
  horusecCliEnableCommitAuthor?: boolean;
  horusecCliRepositoryName?: string;
  horusecCliCustomRulesPath?: string;
  horusecCliEnableInformationSeverity?: boolean;
  horusecCliContainerBindProjectPath?: string;
  horusecCliHeaders?: string;
  horusecCliFalsePositiveHashes?: string[];
  horusecCliRiskAcceptHashes?: string[];
  horusecCliSeveritiesToIgnore?: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN', 'INFO'];
  horusecCliEnableOwaspDependencyCheck?: boolean;
  horusecCliEnableShellcheck?: boolean;
}
