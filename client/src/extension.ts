import * as cp from "child_process";
import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext, workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";

let tfjsExpress: cp.ChildProcess;
let languageClient: LanguageClient;

export async function activate(context: ExtensionContext): Promise<void> {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Please wait while the Toxicity model is being loaded.",
      cancellable: false,
    },
    () => {
      const expressModule = context.asAbsolutePath(
        path.join("express", "express.js")
      );

      tfjsExpress = cp.spawn("node", [expressModule]);

      return new Promise((resolve) =>
        tfjsExpress.stdout.on("data", (data) => {
          if (data.toString().includes("SERVER UP AND RUNNING")) {
            resolve(true);
          }
        })
      );
    }
  );

  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "plaintext" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  languageClient = new LanguageClient(
    "textToxicityClassifier",
    "Text toxicity classifier",
    serverOptions,
    clientOptions
  );

  languageClient.start();
}

export async function deactivate(): Promise<void> {
  tfjsExpress?.kill("SIGINT");
  await languageClient?.stop();
}
