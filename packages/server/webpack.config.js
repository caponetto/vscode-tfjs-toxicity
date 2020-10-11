const nodeExternals = require("webpack-node-externals");
const { merge } = require("webpack-merge");
const common = require("../../webpack.common.config");

module.exports = [
  merge(common, {
    entry: {
      "ls/languageServer": "./src/ls/languageServer.ts",
      "express/express": "./src/express/express.ts"
    },
    target: "node",
    output: {
      libraryTarget: "commonjs2"
    },
    externals: [nodeExternals({ modulesDir: "../../node_modules" })]
  })
];
