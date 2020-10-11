import { LocalHttpServer } from "@kogito-tooling/backend/dist/api";
import { killProcess } from "@kogito-tooling/backend/dist/node";
import * as cp from "child_process";
import * as fs from "fs";
import { getPortPromise } from "portfinder";
import { SERVER_UP, ServiceId } from "vscode-tfjs-toxicity-api";

export class ExpressService extends LocalHttpServer {
  private activeProcess: cp.ChildProcess | undefined;

  public constructor(private readonly expressModule: string) {
    super();
  }

  public identify(): string {
    return ServiceId.TOXICITY_EXPRESS;
  }

  public async start(): Promise<void> {
    this.activeProcess = cp.spawn("node", [this.expressModule, String(this.port)]);

    const timeoutPromise = new Promise(resolve => {
      setTimeout(() => {
        resolve(false);
      }, 60000);
    });

    const checkServerPromise = new Promise(resolve => {
      if (!this.activeProcess || !this.activeProcess.stdout) {
        resolve(false);
        return;
      }

      this.activeProcess.stdout.on("data", data => {
        if (data.toString().includes(SERVER_UP)) {
          resolve(true);
        }
      });
    });

    return Promise.race([timeoutPromise, checkServerPromise]).then((result: boolean) => {
      if (!result) {
        throw new Error("Could not start the server.");
      }
    });
  }

  public stop(): void {
    if (!this.activeProcess) {
      return;
    }

    killProcess(this.activeProcess);
    this.activeProcess = undefined;
  }

  public async satisfyRequirements(): Promise<boolean> {
    if (!fs.existsSync(this.expressModule)) {
      console.error(`${this.expressModule} does not exist.`);
      return false;
    }

    try {
      this.port = await getPortPromise({ port: 3000 });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public resolveEndpoint(endpoint: string): string {
    if (!this.port) {
      throw new Error("There is no port set up.");
    }

    return `http://localhost:${this.port}/${endpoint}`;
  }
}
