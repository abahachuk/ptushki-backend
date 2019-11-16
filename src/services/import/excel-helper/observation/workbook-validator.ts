import XLSX, { WorkBook, WorkSheet } from 'xlsx';
import { validate, ValidationError } from 'class-validator';
import { columns } from './columns';
import { ImportObservationsValidator } from './format-validator';

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
  validationResult: {
    eu_species?: string[];
    eu_sexCode?: string[];
    eu_ageCode?: string[];
    eu_placeCode?: string[];
    date?: string[];
    latitude?: string[];
    longitude?: string[];
    eu_statusCode?: string[];
  };
  rowNumber?: number;
}

export interface RowValidatedData {
  data: RawData;
  rowNumber: number | null;
}

export interface RowErorr {
  verifiedEuRingCodes: boolean;
  error: string | null;
}

export interface DataCheckDto {
  emptyRowCount: number;
  rowCount: number;
  possibleClones: number;
  addedData: RowValidatedData[];
  observations: RawData[];
  euRingErrors: EURingError[];
  invalidDataFormat: RowValidationError[];
}

export interface WorkBookData extends DataCheckDto {
  validFormatData: RowValidatedData[];
}

const getHeaderNames = (worksheet: WorkSheet): string[] => {
  const data: string[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return Object.keys(data[0]);
};

export const checkObservationsHeaderNames = async (workbook: WorkBook, type: string): Promise<HeaderCheck> => {
  const columnNames = columns[type.toLocaleLowerCase()];
  const worksheet = workbook.Sheets[0];
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

export const checkWorkBookData = async (workbook: WorkBook): Promise<WorkBookData> => {
  const workSheet = workbook.Sheets[workbook.SheetNames[0]];
  const workBookData: WorkBookData = {
    emptyRowCount: 0,
    rowCount: 0,
    possibleClones: 0,
    addedData: [],
    observations: [],
    euRingErrors: [],
    validFormatData: [],
    invalidDataFormat: [],
  };
  let currentRowNumber: number = 2;

  const rowsData: RawData[] = XLSX.utils.sheet_to_json(workSheet, { defval: null, blankrows: true});

  if (rowsData.length) {
    workBookData.rowCount = rowsData.length;

    for (const row of rowsData) {

      if (!Object.values(row).join('')) {
        workBookData.emptyRowCount += 1;
        currentRowNumber += 1;
        continue;
      }

      if (row.latitude !== null) row.latitude = +row.latitude;
      if (row.longitude !== null) row.longitude = +row.longitude;

      const validationResult = await validateImportedData(row);

      if (validationResult) {
        workBookData.invalidDataFormat.push({ rowNumber: currentRowNumber, validationResult });
      } else {
        workBookData.validFormatData.push({ rowNumber: currentRowNumber, data: row });
      }

      currentRowNumber += 1;
    }
  }

  return workBookData;
};
