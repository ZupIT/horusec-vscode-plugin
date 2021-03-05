const configOtions = [
  {
    key: 'horusecCliMonitorRetryInSeconds',
    example: '[number] Example: 10',
    description: 'This configuration will identify how much seconds I want to verify if my analysis is near the limit time. The minimal time is 10.'
  },
  {
    key: 'horusecCliPrintOutputType',
    example: '[string] Example: json',
    description: 'The exit can be changed among json or sonarqube or text'
  },
  {
    key: 'horusecCliTypesOfVulnerabilitiesToIgnore',
    example: '[string] Example: MEDIUM',
    description: 'You can specify some type of vulnerability to not apply with an error. The available types are: "LOW, MEDIUM, HIGH". Example: LOW, MEDIUM all the vulnerabilities of the configured type are ignored. '
  },
  {
    key: 'horusecCliJsonOutputFilepath',
    example: '[string] Example: ./output.json',
    description: 'In case the exit issonarqube orjson it must have a name to be saved. '
  },
  {
    key: 'horusecCliFilesOrPathsToIgnore',
    example: '[string] Example: /home/user/go/project/helpers/, **/*tests.go',
    description: 'You can specify some absolute path of files and folders and even patterns to ignore in the analysis dispatch. '
  },
  {
    key: 'horusecCliHorusecApiUri',
    example: '[string] Example: http://0.0.0.0:8000',
    description: 'This configuration identifies where the URL is where the horusec-api is hosted.'
  },
  {
    key: 'horusecCliTimeoutInSecondsRequest',
    example: '[number] Example: 300',
    description: 'This configuration will identify how much time I want to wait in seconds to send the horusec-api object to analysis. The minimum time is 10.'
  },
  {
    key: 'horusecCliTimeoutInSecondsAnalysis',
    example: '[number] Example: 600',
    description: 'This configuration will identify how much time I want to wait in seconds to make an analysis that includes: "getting a project", "sending to analysis", "containers exit" and "getting an answer". The minimum time is 10.'
  },
  {
    key: 'horusecCliRepositoryAuthorization',
    example: '[string] Example: 00000000-0000-0000-0000-000000000000',
    description: 'To run the analysis, you need an authorization token. You can get this token, generating a new token in the horusec repository.'
  },
  {
    key: 'horusecCliReturnErrorIfFoundVulnerability',
    example: '[boolean] Example: false',
    description: 'This configuration if you want to return the exit (1) if you find any vulnerability in the analysis. (Used in pipelines).'
  },
  {
    key: 'horusecCliProjectPath',
    example: '[string] Example: ./my-project',
    description: 'This configuration works if you want to change  the analysis directory. If this value is not passed, Horusec will ask if you want to run the analysis in the current directory. If it passes, it will begin the analysis in the informed directory without asking. '
  },
  {
    key: 'horusecCliCertInsecureSkipVerify',
    example: '[boolen] Example: false',
    description: 'It is used to disable the certification validation. The use is not recommended outside test cases.',
  },
  {
    key: 'horusecCliCertPath',
    example: '[string] Example: /home/example/ca.crt',
    description: 'Using to pass the certificate path'
  },
  {
    key: 'horusecCliFilterPath',
    example: '[string] Example: ./frontend',
    description: 'This configuration works to configure the path to run the analysis and to keep the actual path in your base. Example: a project that contains backend and frontend, you want to run in base path, but you want to analyze only the frontend.'
  },
  {
    key: 'horusecCliEnableGitHistoryAnalysis',
    example: '[boolean] Example: false',
    description: 'This configuration works to know if you want to enable the tools and the run analysis in the gitleaks in git history, searching for vulnerabilities'
  },
  {
    key: 'horusecCliEnableCommitAuthor',
    example: '[boolean] Example: false',
    description: 'Used to enable and disable the commit author. If the author doesnt pass, it will be empty. If it passes, you will search the git history of who is the vulnerabitity author found by Horusec. If this option is enabled the user must have git installed and the .git folder in the base where the analysis is running'
  },
  {
    key: 'horusecCliRepositoryName',
    example: '[string] Example: MyRepository',
    description: 'If the authorization token is from the organization, it must send the repository name to be analyze, if the repository does not exist in Horusec database, you will have to create a name presented in this configuration.'
  },
  {
    key: 'horusecCliFalsePositiveHashes',
    example: '[array string] Example: ["", ""]',
    description: 'Used to ignore vulnerability in analyzes and set to False positive. ATTENTION when you add this configuration directly to the CLI, the configuration will go over writing the settings of the Horusec graphical interface.'
  },
  {
    key: 'horusecCliRiskAcceptHashes',
    example: '[array string] Example: ["", ""]',
    description: 'Used to ignore the analysis vulnerabilities and to configure with accepted risk type. Pay attention when you add this configuration directly to CLI, the configuration will writer the graphic interface configuration of Horusec. '
  },
  {
    key: 'horusecCliCustomRulesPath',
    example: '[string] Example: /horusec/horusec-custom-rules.json',
    description: 'Used to pass the path to the horusec custom rules file. '
  },
  {
    key: 'horusecCliEnableInformationSeverity',
    example: '[boolean] Example: false',
    description: 'Used to enable or disable information severity vulnerabilities, information vulnerabilities can contain a lot of false positives.'
  },
  {
    key: 'horusecCliContainerBindProjectPath',
    example: '[string] Example: ./project/folder-to-analyse',
    description: 'Used to pass project path in host when running horusec cli inside a container.',
  },
  {
    key: 'horusecCliHeaders',
    example: '[string] Example: {\"x-header\": \"x-value\"}',
    description: 'Used to send dynamic headers on dispatch http request to horusec api service.'
  },
];

const getConfigOptionsKeys = () => {
  const keys: string[] = [];

  configOtions.forEach(configItem => {
    keys.push(configItem.key);
  });

  return keys;
};

const getConfigItemByKey = (key: string) => {
  return configOtions.find((item) => item.key === key);
};

export {
  configOtions,
  getConfigOptionsKeys,
  getConfigItemByKey
};
