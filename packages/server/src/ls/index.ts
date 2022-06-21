import axios from "axios";
import {
  createConnection,
  Diagnostic,
  DiagnosticSeverity,
  InitializeParams,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { TextClassification } from "vscode-tfjs-toxicity-api";

const REGEX_WORDS = /\w+/g;
const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
let classifyEndpoint: string;

connection.onInitialize((params: InitializeParams) => {
  classifyEndpoint = params.initializationOptions?.classifyEndpoint;
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  };
});

documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  try {
    if (!classifyEndpoint) {
      return;
    }

    const words = textDocument.getText().match(REGEX_WORDS);
    if (!words) {
      return;
    }

    const response = await axios.post(classifyEndpoint, {
      text: words.join(" "),
    });

    const diagnostics: Diagnostic[] = [];
    let match: RegExpExecArray | null;
    let wordCount = -1;

    while ((match = REGEX_WORDS.exec(textDocument.getText()))) {
      wordCount++;
      response.data.forEach((element: TextClassification) => {
        if (!element.results[wordCount].match) {
          return;
        }

        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: textDocument.positionAt(REGEX_WORDS.lastIndex - match![0].length),
            end: textDocument.positionAt(REGEX_WORDS.lastIndex),
          },
          message: `${match}: ${element.label}`,
        });
      });
    }

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  } catch (e) {
    console.error(e);
  }
}

documents.listen(connection);
connection.listen();
