import Excel, { Column, Worksheet, Workbook, Row, Cell } from 'exceljs';
import { properties } from './properties';
import { CustomError } from '../../utils/CustomError';

const createColumns = (columnNames: string[]): Partial<Column>[] => {
  const createdColumns: Partial<Column>[] = [];

  if (columnNames) {
    columnNames.forEach(
      (name: string): void => {
        const extendedColumn = Object.assign({}, properties.colProperties, { header: name, key: name });
        createdColumns.push(extendedColumn);
      },
    );
  }

  return createdColumns;
};

const setStyleToRow = (row: Row, styles: Partial<Cell>): void => {
  row.eachCell(
    (cell: Cell): void => {
      // eslint-disable-next-line  no-param-reassign
      cell.style = styles;
    },
  );
};

export const createExcelWorkBook = async (columnNames: string[]): Promise<Workbook> => {
  const workbook: Workbook = new Excel.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet(properties.sheetName);
  const columnNamesLength: number = columnNames ? columnNames.length : 0;
  const extendedFilter = Object.assign({}, properties.wsAutoFilter, { to: { row: 1, column: columnNamesLength } });

  workbook.properties = properties.wbProperties;
  workbook.views = properties.wbViews;

  worksheet.columns = createColumns(columnNames);
  worksheet.views = properties.wsViews;
  worksheet.autoFilter = extendedFilter;

  setStyleToRow(worksheet.getRow(1), properties.headerCellStyles);

  return workbook;
};

export interface WorksheetParsingResult {
  headers: string[];
  data: object[];
}
interface WorksheetParsingStatus {
  rowCount: number;
  emptyRowCount: number;
}

export const validateWorksheetColumnHeaders = (headers: string[], expectedHeaders: string[]): void => {
  const errors = expectedHeaders.reduce(
    (acc: string[], item: string) => (!headers.includes(item) ? acc.concat(item) : acc),
    [],
  );
  if (errors.length) {
    // todo inject this error in status
    throw new CustomError(`Missed column titles: ${errors.join(', ')}`, 400);
  }
};

const worksheetParser = (
  worksheet: Worksheet,
  expectedHeaders: string[],
  status: WorksheetParsingStatus,
): WorksheetParsingResult => {
  let rowNumber = 1;
  const headers: string[] = [];
  const data: any[] = [];
  // README worksheet.rowCount not always shows correct amount of rows
  //  try delete row from .xls
  // eslint-disable-next-line no-param-reassign
  status.rowCount = worksheet.rowCount - 1;
  while (rowNumber <= worksheet.rowCount) {
    const row = worksheet.getRow(rowNumber);

    if (row.values.length === 0) {
      if (rowNumber === 1) {
        // eslint-disable-next-line no-param-reassign
        status.emptyRowCount += 1;
        throw new CustomError('Column headers are missed: parsing stopped', 400);
      }
      rowNumber += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    const rowData: { [index: string]: any } = {};
    row.eachCell(
      // eslint-disable-next-line no-loop-func
      (cell: Cell, index: number): void => {
        if (rowNumber === 1) {
          // eslint-disable-next-line no-unused-expressions
          cell.model.value && headers.push(cell.model.value.toString());
        } else rowData[headers[index - 1]] = cell.model.value;
      },
    );
    // eslint-disable-next-line no-unused-expressions
    rowNumber !== 1 && data.push(rowData);
    rowNumber += 1;
  }

  validateWorksheetColumnHeaders(headers, expectedHeaders);

  return Object.assign(status, { headers, data });
};

export const workbookParser = (
  workbook: Workbook,
  expectedHeaders: string[],
  status: WorksheetParsingStatus,
): WorksheetParsingResult[] => {
  const worksheet = workbook.getWorksheet(1);
  // README for a while parsed only first sheet, but returned array,
  //  like it were parsed all sheets in book. It's predefined contract
  return [worksheetParser(worksheet, expectedHeaders, status)];
};
