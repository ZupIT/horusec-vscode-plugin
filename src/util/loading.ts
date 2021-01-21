import * as vscode from 'vscode';

let isLoading: boolean;
const statusLoading = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
statusLoading.text = '$(sync~spin) Horusec: Security analysis running';
statusLoading.tooltip = 'Hold on! Horusec is analyzing your code.';

function startLoading(): void {
  isLoading = true;
  statusLoading.show();
}

function stopLoading(): void {
  statusLoading.hide();
  isLoading = false;
}

export {
  startLoading,
  stopLoading,
  isLoading,
  statusLoading
};
