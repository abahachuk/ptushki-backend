export interface Dictionary {
  desc_eng: string | null;
  desc_rus?: string | null;
  desc_byn?: string | null;
}

export interface AbleToExportAndImportEuring {
  exportEURING(): string;
  importEURING(code: string): any;
}
