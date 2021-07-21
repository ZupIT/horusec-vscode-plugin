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
  horusecCliWorkDir?: {
    'go': [],
    'csharp': [],
    'ruby': [],
    'python': [],
    'java': [],
    'kotlin': [],
    'javaScript': [],
    'leaks': [],
    'hcl': [],
    'php': [],
    'c': [],
    'yaml': [],
    'generic': [],
    'elixir': [],
    'shell': [],
    'dart': [],
    'nginx': []
  };
  horusecCliToolsConfig?: {
      'Bandit': {
          'istoignore': false
      },
      'Brakeman': {
          'istoignore': false
      },
      'Eslint': {
          'istoignore': false
      },
      'Flawfinder': {
          'istoignore': false
      },
      'GitLeaks': {
          'istoignore': false
      },
      'GoSec': {
          'istoignore': false
      },
      'HorusecCsharp': {
          'istoignore': false
      },
      'HorusecDart': {
          'istoignore': false
      },
      'HorusecJava': {
          'istoignore': false
      },
      'HorusecKotlin': {
          'istoignore': false
      },
      'HorusecKubernetes': {
          'istoignore': false
      },
      'HorusecLeaks': {
          'istoignore': false
      },
      'HorusecNodeJS': {
          'istoignore': false
      },
      'NpmAudit': {
          'istoignore': false
      },
      'PhpCS': {
          'istoignore': false
      },
      'Safety': {
          'istoignore': false
      },
      'SecurityCodeScan': {
          'istoignore': false
      },
      'Semgrep': {
          'istoignore': false
      },
      'ShellCheck': {
          'istoignore': false
      },
      'TfSec': {
          'istoignore': false
      },
      'YarnAudit': {
          'istoignore': false
      },
      'DotnetCli': {
          'istoignore': false
      },
      'Nancy': {
          'istoignore': false
      }
  };
  horusecCliCustomImages?: {
      'c': '',
      'csharp': '',
      'dart': '',
      'elixir': '',
      'generic': '',
      'go': '',
      'hcl': '',
      'java': '',
      'javascript': '',
      'kotlin': '',
      'leaks': '',
      'php': '',
      'python': '',
      'ruby': '',
      'shell': '',
      'yaml': ''
  };
  horusecCliEnableOwaspDependencyCheck?: boolean;
  horusecCliEnableShellcheck?: boolean;
}
