import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs-node";
import * as cors from "cors";
import * as express from "express";

toxicity.load(0.6, []).then((model: toxicity.ToxicityClassifier) => {
  const app = express();
  app.use(cors(), express.json());

  app.listen(3000, () => {
    console.log("SERVER UP AND RUNNING");
  });

  app.post(
    "/classify",
    async (request: express.Request, response: express.Response) => {
      if (!request.body || !request.body.text) {
        return response.status(400).send({ message: "Invalid request" });
      }

      return response.json(await model.classify(request.body.text.split(" ")));
    }
  );
});
