import Excel, { Column, Worksheet, Workbook, Row, Cell } from 'exceljs';
import { validate, ValidationError } from 'class-validator';
import { excelColumns } from './excel-columns';
import { excelProperties } from './excel-properties';
import { ImportValidator } from './format-validator';

interface ParsedErrors {
  [key: string]: string[];
}
interface RawData {
  [key: string]: {};
}

export interface HeaderCheck {
  verified: boolean;
  errors: string[];
}

export interface DataCheck {
  emptyRowCount: number;
  rowCount: number;
  addedData: [];
  euRingErrors: [];
  validFormatData: [];
  invalidDataFormat: [];
}

const createColumns = (columnNames: string[]): Partial<Column>[] => {
  const columns: Partial<Column>[] = [];

  if (columnNames) {
    columnNames.forEach(
      (name: string): void => {
        const extendedColumn = Object.assign({}, excelProperties.colProperties, { header: name, key: name });
        columns.push(extendedColumn);
      },
    );
  }

  return columns;
};

const setStyleToRow = (row: Row, styles: Partial<Cell>): void => {
  row.eachCell(
    (cell: Cell): void => {
      // eslint-disable-next-line  no-param-reassign
      cell.style = styles;
    },
  );
};

export const createExcelWorkBook = async (type: string): Promise<Workbook> => {
  const workbook: Workbook = new Excel.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet(excelProperties.sheetName);
  const columnNames: string[] = excelColumns[type];
  const columnNamesLength: number = columnNames ? columnNames.length : 0;
  const extendedFilter = Object.assign({}, excelProperties.wsAutoFilter, { to: { row: 1, column: columnNamesLength } });

  workbook.properties = excelProperties.wbProperties;
  workbook.views = excelProperties.wbViews;

  worksheet.columns = createColumns(columnNames);
  worksheet.views = excelProperties.wsViews;
  worksheet.autoFilter = extendedFilter;

  setStyleToRow(worksheet.getRow(1), excelProperties.headerCellStyles);

  return workbook;
};

const getHeaderNames = (worksheet: Worksheet): string[] => {
  const headers: string[] = [];

  worksheet.getRow(1).eachCell(
    (cell: Cell): void => {
      if (cell.model.value) {
        headers.push(cell.model.value.toString());
      }
    },
  );

  return headers;
};

export const checkHeaderNames = async (workbook: Workbook, type: string): Promise<HeaderCheck> => {
  let excelHeaders: string[] = [];
  const errors: string[] = [];
  const columnNames = excelColumns[type];
  const worksheet = workbook.getWorksheet(1);
  let verified = false;

  if (worksheet) {
    excelHeaders = getHeaderNames(worksheet);

    verified = columnNames.every(
      (name: string): boolean => {
        const isHeaderExists = excelHeaders.includes(name);

        if (isHeaderExists) {
          return isHeaderExists;
        }

        errors.push(name);

        return isHeaderExists;
      },
    );
  }

  return { verified, errors };
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
// eslint-disable-next-line  consistent-return
const validateImportedData = async (data: any): Promise<any> => {
  const createdModel = await ImportValidator.create(data);
  const errors = await validate(createdModel);
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  let parsedErrors: Record<string, any> = [];

  if (errors.length) {
    parsedErrors = errors.reduce(
      (acc: ParsedErrors, error: ValidationError): ParsedErrors => ({
        ...acc,
        [error.property]: Object.values(error.constraints),
      }),
      {},
    );
    return parsedErrors;
  }
};

export const checkImportedData = async (workbook: Workbook): Promise<DataCheck> => {
  let rowNumber = 2;
  const headers: string[] = [];
  const worksheet = workbook.getWorksheet(1);
  const fileImportStatus: DataCheck = {
    emptyRowCount: 0,
    rowCount: 0,
    addedData: [],
    euRingErrors: [],
    validFormatData: [],
    invalidDataFormat: [],
  };

  if (worksheet) {
    worksheet.getRow(1).eachCell(
      (cell: Cell): void => {
        if (cell.model.value) {
          headers.push(cell.model.value.toString());
        }
      },
    );

    fileImportStatus.rowCount = worksheet.rowCount - 1;
    while (rowNumber <= worksheet.rowCount) {
      const rawData: RawData = {};
      const row = worksheet.getRow(rowNumber);

      if (row.values.length === 0) {
        fileImportStatus.emptyRowCount += 1;
        rowNumber += 1;
        // eslint-disable-next-line no-continue
        continue;
      }

      row.eachCell(
        (cell: Cell, index: number): void => {
          if (headers[index - 1] === 'date') {
            try {
              // @ts-ignore
              rawData[headers[index - 1]] = new Date(cell.model.value).toISOString();
            } catch (e) {
              rawData[headers[index - 1]] = '';
            }
          } else {
            // @ts-ignore
            rawData[headers[index - 1]] = cell.model.value.toString();
          }
        },
      );
      // eslint-disable-next-line no-await-in-loop
      const result = await validateImportedData(rawData);

      if (result) {
        // @ts-ignore
        fileImportStatus.invalidDataFormat.push({ rowNumber, result });
      } else {
        // @ts-ignore
        fileImportStatus.validFormatData.push({ rowNumber, data: rawData });
      }

      rowNumber += 1;
    }
  }

  return fileImportStatus;
};
