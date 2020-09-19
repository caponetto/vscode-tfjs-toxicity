const express = require("express");
const cors = require("cors");
const toxicity = require("@tensorflow-models/toxicity");
require("@tensorflow/tfjs-node");

toxicity.load(0.6).then((model) => {
  const app = express();
  app.use(cors(), express.json());

  app.listen(3000, () => {
    console.log("SERVER UP AND RUNNING");
  });

  app.post("/classify", async (req, res) => {
    if (!req.body || !req.body.text) {
      return res.status(400).send({ message: "Invalid request" });
    }

    return res.json(await model.classify(req.body.text.split(" ")));
  });
});
