import { getCustomRepository, QueryFailedError, Repository } from 'typeorm';
import { validate } from 'class-validator';
import Excel, { Workbook } from 'exceljs';
import AbstractImporter, { ImporterType, ImportInput } from './AbstractImporter';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { cachedEURINGCodes } from '../../entities/euring-codes/cached-entities-fabric';
import { parseValidationErrors } from '../../validation/validation-results-parser';
import { Observation } from '../../entities/observation-entity';
import { Ring } from '../../entities/ring-entity';
import { CustomError } from '../../utils/CustomError';
import { workbookParser } from '../excel-service/helper';

interface EURINGs {
  [index: string]: string[] | number[];
}

interface ImportWorksheetXLSCommon {
  importedCount: number;
  rowCount: number;
  emptyRowCount: number;
  EURINGErrors: { rowNumber: number; result: { [index: string]: any[] } }[];
  formatErrors: { rowNumber: number; result: { [index: string]: any[] } }[];
  clones: number[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ImportWorksheetXLSDto extends ImportWorksheetXLSCommon {}

export interface ImportWorksheetXLSStatus extends ImportWorksheetXLSCommon {
  headers: any[];
  data: any[];
  validEntities: any[];
}

export default abstract class XLSBaseImporter extends AbstractImporter<
  ImportInput<Express.Multer.File>,
  ImportWorksheetXLSDto
> {
  public type: ImporterType = ImporterType.xls;

  public abstract entity: { create(value: any): Observation | Ring };

  public abstract repository: Repository<Observation | Ring>;

  public abstract mappers: { [index: string]: [string, (arg: any) => any] };

  public abstract expectedColumnHeaders: string[];

  public options: MulterOptions = {
    extensions: ['.xls', '.xlsx'],
    any: true,
  };

  public static getHeaders(mappers: { [index: string]: [string, (arg: any) => any] }): string[] {
    return Object.values(mappers).map(([header]) => header);
  }

  public async import({ sources }: ImportInput<Express.Multer.File>): Promise<ImportWorksheetXLSDto> {
    try {
      if (!sources.length) {
        throw new CustomError('No files detected', 400);
      }
      this.filterFiles(sources);

      // TODO: clarify if we need to support multiple files
      const [file] = sources;

      const workbook: Workbook = await new Excel.Workbook().xlsx.load(file.buffer);
      const importStatus = this.initImportStatus();
      const [worksheet] = workbookParser(workbook, this.expectedColumnHeaders, importStatus);
      const codes = await XLSBaseImporter.EURINGcodes;

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < worksheet.data.length; i++) {
        try {
          const preEntity = this.mapParsedWorksheetRow(worksheet.data[i], importStatus, i);
          // eslint-disable-next-line no-await-in-loop
          const entity = await this.createEntityAndValidate(preEntity, importStatus, i);
          this.checkEURINGcodes(entity, importStatus, i, codes);
          importStatus.validEntities.push(entity);
          // eslint-disable-next-line no-empty
        } catch {}
      }

      // redefine place in process of checking: right now it's done on data
      // and already validated entities are skipped by this there are two options
      // to do this on validated entities
      // or do it before validation

      // take in account that order needs to be preserved
      // to correctly specify row number
      this.checkForClones(importStatus);

      if (
        !Object.keys(importStatus.EURINGErrors).length &&
        !Object.keys(importStatus.formatErrors).length &&
        !importStatus.clones.length
      ) {
        await this.repository.insert(importStatus.validEntities);
        importStatus.importedCount = importStatus.validEntities.length;
      }

      return this.translateStatusForResponse(importStatus);
    } catch (e) {
      if (e instanceof CustomError) throw e;
      // @ts-ignore-next-line
      if (e instanceof QueryFailedError) throw new CustomError(`${e.name}: ${e.detail}`, 500);
      throw new CustomError(e.message, 500);
    }
  }

  public static EURINGcodes: Promise<EURINGs> = (async () => {
    return Object.keys(cachedEURINGCodes).reduce(async (promise: Promise<EURINGs>, key: string) => {
      const acc = await promise;
      const splitKey = (s => s[0].toLowerCase() + s.slice(1))(key.replace('Cached', ''));
      acc[splitKey] = await getCustomRepository(cachedEURINGCodes[key]).getAllIds();
      return acc;
    }, Promise.resolve({}));
  })();

  public mapParsedWorksheetRow(row: any, status: ImportWorksheetXLSStatus, i: number): any {
    const errors: { [index: string]: string[] } = {};
    const mappedRow = Object.entries(this.mappers).reduce((acc: { [index: string]: any }, [key, [field, f]]) => {
      try {
        acc[key] = f(row[field]);
      } catch (e) {
        errors[field] = [e.message];
      }
      return acc;
    }, {});

    if (!errors.length) {
      return mappedRow;
    }
    // eslint-disable-next-line no-param-reassign
    status.formatErrors.push({ rowNumber: i + 1, result: errors });
    throw new Error();
  }

  public async createEntityAndValidate(
    preEntity: any,
    status: ImportWorksheetXLSStatus,
    i: number,
  ): Promise<void | any> {
    const entity = this.entity.create(preEntity);
    const errors = await validate(entity);
    if (errors.length) {
      const parsedErrors = parseValidationErrors(errors);
      // eslint-disable-next-line no-param-reassign
      status.formatErrors.push({ rowNumber: i + 1, result: parsedErrors });
      throw new Error();
    }
    return entity;
  }

  public checkEURINGcodes(entity: any, status: ImportWorksheetXLSStatus, i: number, codes: any): void {
    const wrongKeys = Object.entries(entity)
      .filter(([key, value]) => (codes[key] ? !codes[key].includes(value) : false))
      .reduce((acc: { [index: string]: any }, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    if (Object.keys(wrongKeys).length) {
      // eslint-disable-next-line no-param-reassign
      status.EURINGErrors.push({ rowNumber: i + 1, result: wrongKeys });
      throw new Error();
    }
  }

  public checkForClones(status: ImportWorksheetXLSStatus): void {
    const { data } = status;
    const map = new Map();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < data.length; i++) {
      const row = JSON.stringify(data);
      if (!row) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (map.has(row)) {
        status.clones.push(i + 2);
      } else {
        map.set(JSON.stringify(data), i);
      }
    }
  }

  protected initImportStatus(): ImportWorksheetXLSStatus {
    return Object.assign(
      {},
      {
        rowCount: 0,
        importedCount: 0,
        emptyRowCount: 0,
        headers: [],
        data: [],
        validEntities: [],
        EURINGErrors: [],
        formatErrors: [],
        clones: [],
      },
    );
  }

  protected translateStatusForResponse(status: ImportWorksheetXLSStatus): ImportWorksheetXLSDto {
    const { rowCount, emptyRowCount, EURINGErrors, formatErrors, clones, importedCount } = status;
    return {
      rowCount,
      emptyRowCount,
      importedCount,
      EURINGErrors,
      formatErrors,
      clones,
    };
  }
}
