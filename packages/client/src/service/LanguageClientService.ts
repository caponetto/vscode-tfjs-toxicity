import { Service } from "@kogito-tooling/backend/dist/api";
import * as fs from "fs";
import { workspace } from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient";
import { ServiceId } from "vscode-tfjs-toxicity-api";

export class LanguageClientService implements Service {
  private languageClient: LanguageClient;

  public constructor(private readonly classifyEndpoint: string, private readonly lsModule: string) {}

  public identify(): string {
    return ServiceId.LANGUAGE_SERVER;
  }

  public async start(): Promise<void> {
    const serverOptions: ServerOptions = {
      run: { module: this.lsModule, transport: TransportKind.ipc },
      debug: {
        module: this.lsModule,
        transport: TransportKind.ipc,
        options: { execArgv: ["--nolazy", "--inspect=6009"] }
      }
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: [{ scheme: "file", language: "plaintext" }],
      synchronize: {
        fileEvents: workspace.createFileSystemWatcher("**/.clientrc")
      },
      initializationOptions: {
        classifyEndpoint: this.classifyEndpoint
      }
    };

    this.languageClient = new LanguageClient(this.identify(), this.identify(), serverOptions, clientOptions);

    this.languageClient.start();
  }

  public stop(): void {
    this.languageClient?.stop();
  }

  public async satisfyRequirements(): Promise<boolean> {
    if (!fs.existsSync(this.lsModule)) {
      console.error(`${this.lsModule} does not exist.`);
      return false;
    }
    return true;
  }
}
