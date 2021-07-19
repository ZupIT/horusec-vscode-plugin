/**
 * Copyright 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  horusecCliWorkDir?: any;
  horusecCliToolsConfig?: any;
  horusecCliFalsePositiveHashes?: string[];
  horusecCliRiskAcceptHashes?: string[];
}
