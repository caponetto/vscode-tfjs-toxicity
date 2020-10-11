import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs-node";
import * as cors from "cors";
import * as express from "express";
import { CLASSIFY_ENDPOINT, SERVER_UP } from "vscode-tfjs-toxicity-api";

const args = process.argv.slice(2);

toxicity.load(0.6, []).then((model: toxicity.ToxicityClassifier) => {
  const app = express();
  app.use(cors(), express.json());

  app.listen(args[0], () => {
    console.log(SERVER_UP);
  });

  app.post(`/${CLASSIFY_ENDPOINT}`, async (request: express.Request, response: express.Response) => {
    if (!request.body || !request.body.text) {
      return response.status(400).send({ message: "Invalid request" });
    }

    return response.json(await model.classify(request.body.text.split(" ")));
  });
});
