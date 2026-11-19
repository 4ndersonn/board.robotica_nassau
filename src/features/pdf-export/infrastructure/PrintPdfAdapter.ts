export interface PdfPrintPort {
  triggerVectorPdfPrint(documentTitle: string): void;
}

export class PrintPdfAdapter implements PdfPrintPort {
  public triggerVectorPdfPrint(documentTitle: string): void {
    const previousTitle = window.document.title;
    window.document.title = documentTitle;
    window.print();
    window.document.title = previousTitle;
  }
}

export const printPdfAdapter = new PrintPdfAdapter();
