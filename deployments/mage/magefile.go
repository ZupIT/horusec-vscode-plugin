// Copyright 2021 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//go:build mage

package main

import (
	"context"
	"fmt"
	"os"

	"github.com/magefile/mage/sh"
	// mage:import
	_ "github.com/ZupIT/horusec-devkit/pkg/utils/mageutils"
	"github.com/google/go-github/v40/github"
	"golang.org/x/oauth2"
)

const (
	replaceVscodeVersion = "this.version=\"%s\""
	replaceCLIVersion    = "this.engines.horusecCLI=\"horuszup/horusec-cli:%s\""
	packageJsonPath      = "package.json"
)

const (
	envCLIVersion     = "HORUSEC_CLI_VERSION"
	envVsCodePlugin   = "HORUSEC_VSCODE_VERSION"
	envRepositoryOrg  = "HORUSEC_REPOSITORY_ORG"
	envRepositoryName = "HORUSEC_REPOSITORY_NAME"
	envGithubToken    = "GITHUB_TOKEN"
)

func UpdateVersioningFiles() error {
	if err := sh.RunV("npm", "install", "-g", "json"); err != nil {
		return err
	}

	if err := replacePlatformVersion(getCLIVersion()); err != nil {
		return err
	}

	if err := replacePlatformVersion(getGetVsCodePluginVersion()); err != nil {
		return err
	}

	return nil
}

func replacePlatformVersion(value string) error {
	return sh.RunV("json", "-I", "-f", packageJsonPath, "-e", value)
}

func getCLIVersion() string {
	return fmt.Sprintf(replaceCLIVersion, os.Getenv(envCLIVersion))
}

func getGetVsCodePluginVersion() string {
	return fmt.Sprintf(replaceVscodeVersion, os.Getenv(envVsCodePlugin))
}

func CreateRelease() error {
	ctx := context.Background()

	token := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: getGithubToken()})
	githubClient := github.NewClient(oauth2.NewClient(ctx, token))

	_, resp, err := githubClient.Repositories.CreateRelease(ctx, getRepositoryOrg(), getRepositoryName(),
		getRepositoryRelease())
	if github.CheckResponse(resp.Response) != nil {
		return err
	}

	return nil
}

func getRepositoryRelease() *github.RepositoryRelease {
	return &github.RepositoryRelease{
		Draft:   getDraft(),
		TagName: getTagName(),
		Name:    getTagName(),
	}
}

func getTagName() *string {
	tag := os.Getenv(envVsCodePlugin)
	return &tag
}

func getDraft() *bool {
	draft := true
	return &draft
}

func getRepositoryOrg() string {
	return os.Getenv(envRepositoryOrg)
}

func getRepositoryName() string {
	return os.Getenv(envRepositoryName)
}

func getGithubToken() string {
	return os.Getenv(envGithubToken)
}
