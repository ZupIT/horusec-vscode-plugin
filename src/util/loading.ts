import * as vscode from 'vscode';

let loading = {start: false, stop: false};
const statusLoading = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
statusLoading.text = '$(sync~spin) Horusec: Security analysis running';
statusLoading.tooltip = 'Hold on! Horusec is analyzing your code.';

function startLoading(command: 'start'|'stop'): void {
  loading[command] = true;
  statusLoading.show();
}

function stopLoading(command: 'start'|'stop'): void {
  statusLoading.hide();
  loading[command] = false;
}

function isLoading(command: 'start'|'stop'): boolean {
  return loading[command];
}

export {
  startLoading,
  stopLoading,
  isLoading,
  statusLoading
};
