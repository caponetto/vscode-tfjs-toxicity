const CopyWebpackPlugin = require("copy-webpack-plugin");
const { merge } = require("webpack-merge");
const common = require("../../webpack.common.config");

module.exports = [
  merge(common, {
    output: {
      library: "ToxicityClassification",
      libraryTarget: "umd",
      umdNamedDefine: true
    },
    externals: {
      vscode: "commonjs vscode"
    },
    target: "node",
    entry: {
      "extension/extension": "./src/extension/extension.ts"
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: "../server/dist/ls/languageServer.js", to: "server/ls.js" },
        { from: "../server/dist/express/express.js", to: "server/express.js" }
      ])
    ]
  })
];
