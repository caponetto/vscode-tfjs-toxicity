import { BackendManagerService } from "@kie-tools-core/backend/dist/api";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { CLASSIFY_ENDPOINT } from "vscode-tfjs-toxicity-api";
import { ExpressService } from "../service/ExpressService";
import { LanguageClientService } from "../service/LanguageClientService";

let backendManager: BackendManagerService;

export async function activate(context: ExtensionContext): Promise<void> {
  const serverDir = path.join("dist", "server");
  const serverOutPath = context.asAbsolutePath(serverDir);
  const expressOutPath = path.join(serverOutPath, "express.js");
  const lsOutPath = path.join(serverOutPath, "ls.js");
  const expressService = new ExpressService(expressOutPath);

  backendManager = new BackendManagerService({
    localHttpServer: expressService,
  });

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Please wait while the Toxicity model is being loaded.",
      cancellable: false,
    },
    async () => {
      await backendManager.start();
      const classifyEndpoint = expressService.resolveEndpoint(CLASSIFY_ENDPOINT);
      const lsClientService = new LanguageClientService(classifyEndpoint, lsOutPath);
      await backendManager.registerService(lsClientService);
    }
  );
}

export async function deactivate(): Promise<void> {
  backendManager?.stop();
}
