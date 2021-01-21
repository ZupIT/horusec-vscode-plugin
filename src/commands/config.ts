import * as vscode from 'vscode';
import { getConfigOptionsKeys, getConfigItemByKey } from '../util/confiOptions';
import { writeInConfigFile } from '../util/configFile';

async function configHorusec() {
  let selectedOptionKey = await vscode.window.showQuickPick(getConfigOptionsKeys(), {
    canPickMany: false,
    placeHolder: `Select the flag you want to configure:`
  });

  if (selectedOptionKey) {
    const option = getConfigItemByKey(selectedOptionKey);

    let optionValue: any = await vscode.window.showInputBox({ placeHolder: option.example, prompt: option.description });

    try {
      writeInConfigFile(option.key, JSON.parse(optionValue));
    } catch (err) {
      writeInConfigFile(option.key, optionValue);
    }
  }
}

export {
  configHorusec
};
