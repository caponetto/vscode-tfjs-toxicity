# Text toxicity classification on VS Code

<p align="center">
  <a href="documentation/example.gif"><img src="documentation/example.gif" width="700"></a>
</p>

Putting together [VS Code extension](https://code.visualstudio.com/api), [express](https://expressjs.com/), [tensorflow.js](https://github.com/tensorflow/tfjs), and a text [toxicity classifier](https://github.com/tensorflow/tfjs-models/tree/master/toxicity) into a simple project.

Just for fun. :P

## Modules

1. `client`: Activate the VS Code extension by initializing the express server and establishing a connection with the language server.

1. `server`: Language server responsible for validating the text document and reporting back the diagnostics to the client. It also includes a simple express server that classifies text toxicity through POST requests.

## Running the example

- Open this example in VS Code 1.43+
- In the terminal, execute `yarn run init && yarn run build:fast`
- `F5` to start debugging

Open a text file with some content or type stuff.

VS Code will detect whether text contains toxic content such as _threatening language_, _insults_, _obscenities_, _identity-based hate_, or _sexually explicit language_.

**Note**: The model will be loaded on the first time a text document is opened. This operation takes a few seconds.

## Troubleshooting

Execute the following command if you run into issues when loading the model:
```bash
$ npm rebuild @tensorflow/tfjs-node --build-from-source
```
Then, build the packages with `yarn` again.