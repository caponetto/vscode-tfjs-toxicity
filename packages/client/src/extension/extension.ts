import { BackendManagerService } from "@kogito-tooling/backend/dist/api";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { CLASSIFY_ENDPOINT } from "vscode-tfjs-toxicity-api";
import { ExpressService } from "../service/ExpressService";
import { LanguageClientService } from "../service/LanguageClientService";

const SERVER_DIR = path.join("dist", "server");
const EXPRESS_MODULE = "express.js";
const LS_MODULE = "ls.js";

let backendManager: BackendManagerService;

export async function activate(context: ExtensionContext): Promise<void> {
  const serverOutPath = context.asAbsolutePath(SERVER_DIR);
  const expressService = new ExpressService(path.join(serverOutPath, EXPRESS_MODULE));

  backendManager = new BackendManagerService({
    localHttpServer: expressService
  });

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Please wait while the Toxicity model is being loaded.",
      cancellable: false
    },
    async () => {
      await backendManager.start();
      await backendManager.registerService(
        new LanguageClientService(
          expressService.resolveEndpoint(CLASSIFY_ENDPOINT),
          path.join(serverOutPath, LS_MODULE)
        )
      );
    }
  );
}

export async function deactivate(): Promise<void> {
  backendManager?.stop();
}
