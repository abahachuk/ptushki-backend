import Excel, { Column, Worksheet, Workbook, Row, Cell } from 'exceljs';
import XLSX, { WorkBook, WorkSheet } from 'xlsx';
import { validate, ValidationError } from 'class-validator';
import { columns } from './columns';
import { properties } from './properties';
import { ImportObservationsValidator } from './observation-format-validator';

interface ParsedErrors {
  [key: string]: string[];
}
export interface RawData {
  [key: string]: {} | string;
}

export interface HeaderCheck {
  verified: boolean;
  errors: string[];
}

export interface EURingError {
  rowNumber: number | null;
  status: RowErorr;
}

interface RowValidationError {
  result: ValidationError[];
  rowNumber: number | null;
}

export interface RowValidatedData {
  data: RawData;
  rowNumber: number | null;
}

export interface RowErorr {
  verifiedEuRingCodes: boolean;
  error: string | null;
}

export interface DataCheck {
  emptyRowCount: number;
  rowCount: number;
  possibleClones: number;
  addedData: RowValidatedData[];
  observations: RawData[];
  euRingErrors: EURingError[];
  validFormatData: RowValidatedData[];
  invalidDataFormat: RowValidationError[];
}

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

export const createExcelWorkBook = async (type: string): Promise<Workbook> => {
  const workbook: Workbook = new Excel.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet(properties.sheetName);
  const columnNames: string[] = columns[type];
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

const getHeaderNames = (worksheet: WorkSheet): string[] => {
  const data: string[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return Object.keys(data[0]);
};

export const checkObservationsHeaderNames = async (workbook: WorkBook, type: string): Promise<HeaderCheck> => {
  const columnNames = columns[type.toLocaleLowerCase()];
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const errors: string[] = [];
  let excelHeaders: string[] = [];

  if (worksheet) {
    excelHeaders = getHeaderNames(worksheet);
    columnNames.filter(
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

  const verified = errors.length <= 0;

  return { verified, errors };
};

/* eslint-disable */
const validateImportedData = async (data: any): Promise<any> => {
  const createdModel = await ImportObservationsValidator.create(data);
  const errors = await validate(createdModel);
  // @ts-ignore
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

export const checkObservationImportedData = async (workbook: WorkBook): Promise<DataCheck> => {
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const fileImportStatus: DataCheck = {
    emptyRowCount: 0,
    rowCount: 0,
    possibleClones: 0,
    addedData: [],
    observations: [],
    euRingErrors: [],
    validFormatData: [],
    invalidDataFormat: [],
  };
  let rowNumber = 2;
  const data: any = XLSX.utils.sheet_to_json(worksheet, { defval: null, blankrows: true} );
  if (data.length) {
    fileImportStatus.rowCount = data.length;
    for (const row of data) {

      if (!Object.values(row).join('')) {
        fileImportStatus.emptyRowCount += 1;
        rowNumber += 1;
        continue;
      }

      if (row.latitude !== null) row.latitude = row.latitude.toString();
      if (row.longitude !== null) row.longitude = row.longitude.toString();

      const result = await validateImportedData(row);

      if (result) {
        const error: RowValidationError = { rowNumber, result };
        fileImportStatus.invalidDataFormat.push(error);
      } else {
        const data: RowValidatedData = { rowNumber, data: row };
        fileImportStatus.validFormatData.push(data);
      }

       rowNumber += 1;
    }
  }

  return fileImportStatus;
};
