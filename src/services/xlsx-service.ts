import xlsx from 'xlsx';

interface WithExportableString {
  toExportableString?(): string;
}

interface XlsxExportOptions {
  sheetName: string;
  fileName?: string;
}

const checkProvidedData = (data: any): void => {
  if (!data) {
    throw new Error('No data provided.');
  }

  switch (typeof data) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
      throw new Error('Primitive value provided');
    case 'function':
      throw new Error('Data should not be executable');
    default:
      break;
  }

  if (Array.isArray(data) && !data.length) {
    throw new Error('Empty array provided.');
  }

  if (!Object.keys(data).length) {
    throw new Error('Empty object provided.');
  }
};

export const prepareDataForExport = (data: any): any[] =>
  [].concat(data).map(obj => {
    const copy: any = Object.assign({}, obj);

    Object.keys(copy).forEach(key => {
      const current: WithExportableString = copy[key];

      if (!current) {
        return;
      }

      if (typeof current === 'object' && !Array.isArray(current) && current.toExportableString) {
        copy[key] = current.toExportableString();
      }
    });

    return copy;
  });

export const getWorkBook = (data: any, sheetName: string): xlsx.WorkBook => {
  const prepared: any = prepareDataForExport(data);

  const sheet: any = xlsx.utils.json_to_sheet(prepared);
  const book: xlsx.WorkBook = xlsx.utils.book_new();

  xlsx.utils.book_append_sheet(book, sheet, sheetName);

  return book;
};

export const jsonToXlsx = (data: any, { sheetName, fileName }: XlsxExportOptions): any => {
  checkProvidedData(data);

  const wb: xlsx.WorkBook = getWorkBook(data, sheetName);

  if (fileName) {
    return xlsx.writeFile(wb, fileName);
  }

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
};
