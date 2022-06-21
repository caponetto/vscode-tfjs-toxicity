import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs-node";
import * as cors from "cors";
import * as express from "express";
import { CLASSIFY_ENDPOINT, SERVER_UP_MESSAGE } from "vscode-tfjs-toxicity-api";

const PORT = process.argv[2];
const CLASSIFICATION_THRESHOLD = 0.6;
const CLASSIFY_PATH = `/${CLASSIFY_ENDPOINT}`;

toxicity.load(CLASSIFICATION_THRESHOLD, []).then((model: toxicity.ToxicityClassifier) => {
  const app = express();
  app.use(cors(), express.json());

  app.listen(PORT, () => {
    console.log(SERVER_UP_MESSAGE);
  });

  app.post(CLASSIFY_PATH, async (request: express.Request, response: express.Response) => {
    if (!request.body || !request.body.text) {
      return response.status(400).send({ message: "Invalid request" });
    }

    return response.json(await model.classify(request.body.text.split(" ")));
  });
});
