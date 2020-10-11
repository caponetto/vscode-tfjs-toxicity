export interface TextClassification {
  label: string;
  results: Array<{
    probabilities: Float32Array;
    match: boolean;
  }>;
}
