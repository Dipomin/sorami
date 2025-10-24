declare module 'nodepub' {
  interface EpubDocument {
    addCSS(css: string): void;
    addSection(
      title: string,
      content: string,
      excludeFromContents?: boolean,
      isFrontMatter?: boolean
    ): void;
    getFilesForEPUB(callback: (err: Error | null, files: any) => void): void;
    writeEPUB(
      callback: (err: Error | null, content: Buffer) => void,
      folder: string,
      filename: string,
      files: any
    ): void;
  }

  interface DocumentOptions {
    id: string;
    title: string;
    author?: string;
    description?: string;
    publisher?: string;
    published?: string;
  }

  function document(options: DocumentOptions): EpubDocument;

  export default {
    document,
  };
}
