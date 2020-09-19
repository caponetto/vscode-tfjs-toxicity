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

const ENDPOINT = "http://localhost:3000/classify";

let connection = createConnection(ProposedFeatures.all);
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((_params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  };
});

documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

interface TextClassification {
  label: string;
  results: Array<{
    probabilities: Float32Array;
    match: boolean;
  }>;
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  try {
    const regex = /\w+/g;
    const words = textDocument.getText().match(regex);

    if (!words) {
      return;
    }

    const response = await axios.post(ENDPOINT, {
      text: words.join(" "),
    });

    const diagnostics: Diagnostic[] = [];
    let match: RegExpExecArray | null;
    let wordCount = -1;

    while ((match = regex.exec(textDocument.getText()))) {
      wordCount++;
      response.data.forEach((element: TextClassification) => {
        if (!element.results[wordCount].match) {
          return;
        }

        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: {
            start: textDocument.positionAt(regex.lastIndex - match![0].length),
            end: textDocument.positionAt(regex.lastIndex),
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
