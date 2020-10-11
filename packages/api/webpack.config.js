const nodeExternals = require("webpack-node-externals");
const { merge } = require("webpack-merge");
const common = require("../../webpack.common.config");

module.exports = [
  merge(common, {
    entry: {
      "index": "./src/index.ts"
    },
    output: {
      libraryTarget: "commonjs2"
    },
    externals: [nodeExternals({ modulesDir: "../../node_modules" })]
  })
];
