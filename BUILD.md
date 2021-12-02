
# **BUILD**

## **Table of contents** 
### 1. [**About**](#about)
### 2. [**Environment**](#environment)
### 3. [**Development**](#development)
>#### 3.1. [**Install and Run**](#install-and-run)
>#### 3.2. [**Style Guide**](#style-guide)
>#### 3.3. [**Security**](#security)
### 4. [**Production**](#production)       
>#### 4.1. [**Publish an extension**](#publish-an-extension)


## **About**
The **BUILD.md** is a file to check the environment and build specifications of **`horusec-vscode-plugin`** project.


## **Environment**

- **vscode**: ^1.51.X
- **npm**: 6.x
- **node**: 8.x

## **Development**

We use [**Extension API**](https://code.visualstudio.com/api) for the extension's development.

### **Install and Run**

To install the dependencies, run the command at the root of the project:

```bash
  npm install
```

- If you want to see the extension in development mode, use [**Visual Studio code**](https://code.visualstudio.com/) and run the project using debug via the **`F5`** key or through the **`Run and Debug`** tab.

### **Style Guide**

The tool [**Eslint**](https://eslint.org/) is used for code standardization in this project. You can check if your changes are in accordance with our Style Guide, run the following command:

```bash
  npm run lint
```

### **Security**

We use [**Horusec**](https://horusec.io/site/) CLI to maintain a secure codebase.

To make your installation and execution easier, we created a `Make` command, run: 

```bash
  make security
```

## **Production**

 You need the npm package [**vsce**](https://www.npmjs.com/package/vsce) installed globally to deploy in production, run the command below: 

```bash
  npm install -g vsce
```

### **Publish an extension**
To publish the extension on the [**VSCode Marketplace**](https://marketplace.visualstudio.com/vscode), follow the steps:

**Step 1.** Generate an [**access token**](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token);

**Step 2.** Run the command below, informing the generated token:

```bash
  vsce publish -p $YOUR_MARKETPLACE_TOKEN
```