export type PdfInput = File | Blob | ArrayBuffer | Uint8Array

export interface StepAndRepeatOptions {
  outputSize?: {
    outputWidth?: number;
    outputHeight?: number;
  };
  cols?: number;
  rows?: number;
}
