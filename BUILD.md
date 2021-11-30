# BUILD

Environment and build specifications of the `horusec-vscode-plugin` project.

## Environment

- **vscode**: ^1.51.X
- **npm**: 6.x
- **node**: 8.x

## Development

For the development of the extension, we use the official [Extension API](https://code.visualstudio.com/api).

### Install and Run

To install the dependencies, you must run the following command at the root of the project:

```bash
  npm install
```

In order to visualize the extension in development mode, you must use the editor [Visual Studio code](https://code.visualstudio.com/) and then run the project using debug via the **`F5`** key or through the **`Run and Debug`** tab.

### Style Guide

In this project, the tool [Eslint](https://eslint.org/) is used for code standardization. You can check if your changes are in accordance with our style guide, through the command:

```bash
  npm run lint
```

### Security

To maintain a secure codebase, we use the [Horusec](https://horusec.io/site/) CLI, to facilitate installation and execution, we create a `Make` command.

```bash
  make security
```

## Production

To deploy in production, you need the npm package [vsce](https://www.npmjs.com/package/vsce) installed globally.

```bash
  npm install -g vsce
```

To publish the extension on the [VSCode Marketplace](https://marketplace.visualstudio.com/vscode) it is necessary to generate an [access token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token), and then execute the command below, informing the generated token.

```bash
  vsce publish -p $YOUR_MARKETPLACE_TOKEN
```
