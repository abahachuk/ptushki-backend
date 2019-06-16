import { NextFunction, Request, Response } from 'express';
import Excel, { Workbook } from 'exceljs';
import { getRepository, Repository } from 'typeorm';
import {
  checkObservationsHeaderNames,
  checkObservationImportedData,
  HeaderCheck,
  DataCheck,
  EURingError,
  RowErorr,
  RowValidatedData,
  RawData,
} from './helper';
import { MulterOptions } from '../../../controllers/upload-files-controller';
import AbstractImporter, { ImporterType } from '../AbstractImporter';
import { Species } from '../../../entities/euring-codes/species-entity';
import { Sex } from '../../../entities/euring-codes/sex-entity';
import { Age } from '../../../entities/euring-codes/age-entity';
import { Status } from '../../../entities/euring-codes/status-entity';
import { CustomError } from '../../../utils/CustomError';

export default class XLSImporterValidateObservations extends AbstractImporter {
  public type: ImporterType = 'VALIDATE-XLS';

  public route: string = 'observations';

  public options: MulterOptions = {
    extensions: ['.xls', '.xlsx'],
    any: true,
  };

  private status: Repository<Status> = getRepository(Status);

  private species: Repository<Species> = getRepository(Species);

  private sex: Repository<Sex> = getRepository(Sex);

  private age: Repository<Age> = getRepository(Age);

  private checkEuRingCodes = async (excelData: DataCheck): Promise<void> => {
    const statusCached = await this.status
      .createQueryBuilder('status')
      .select('status.id')
      .getRawMany();
    const speciesMentionedCached = await this.species
      .createQueryBuilder('species')
      .select('species.id')
      .getRawMany();
    const sexMentionedCached = await this.sex
      .createQueryBuilder('sex')
      .select('sex.id')
      .getRawMany();
    const ageMentionedCached = await this.age
      .createQueryBuilder('age')
      .select('age.id')
      .getRawMany();

    try {
      /* eslint-disable */
      for (const row of excelData.validFormatData) {
        const { data, rowNumber }: RowValidatedData = row;
        const { eu_statusCode, eu_species, eu_sexCode, eu_ageCode }: RawData = data;

        if (data) {
          const status = statusCached.filter(
            statusRow => statusRow.status_id === eu_statusCode.toString().toUpperCase());
          const speciesMentioned = speciesMentionedCached.filter(
            speciesRow => speciesRow.species_id === eu_species.toString());
          const sexMentioned = sexMentionedCached.filter(
            sexRow => sexRow.sex_id === eu_sexCode.toString().toUpperCase());
          const ageMentioned = ageMentionedCached.filter(
            ageRow => ageRow.age_id === eu_ageCode.toString().toUpperCase());

          const euCodeErrors: string[] = [];

          if (!status.length) {
            euCodeErrors.push('status');
          }
          if (!speciesMentioned.length) {
            euCodeErrors.push('species');
          }
          if (!sexMentioned.length) {
            euCodeErrors.push('sex');
          }
          if (!ageMentioned.length) {
            euCodeErrors.push('age');
          }

          if (euCodeErrors.length) {
            const rowStatus: RowErorr = {
              verifiedEuRingCodes: false,
              error: `Can not find euRing codes: ${euCodeErrors.join(',')}`,
            };
            const error: EURingError = { rowNumber, status: rowStatus };

            excelData.euRingErrors.push(error);
          } else {
            excelData.addedData.push(row);
          }
        }
      }
    } catch (e) {
      throw new CustomError(e.message, 400);
    }
  };

  private checkPossibleClones = async (excelData: DataCheck): Promise<void> => {
    const map = new Map();
    try {
      for (const row of excelData.addedData) {
        const { data, rowNumber }: RowValidatedData = row;

        if (data) {
          map.set(JSON.stringify(data), rowNumber);
        }
      }
      excelData.possibleClones = excelData.addedData.length - map.size;
    } catch (e) {
      throw new CustomError(e.message, 400);
    }
  };

  private setXLSDataToObservation = async (excelData: DataCheck): Promise<void> => {
      const defaults = {
        manipulated: 'U',
        movedBeforeTheCapture: 9,
        catchingMethod: 'U',
        catchingLures: 'U',
        accuracyOfDate: 9,
        accuracyOfCoordinates: 0,
        pullusAge: 99,
        accuracyOfPullusAge: 'U',
        condition: 0,
        circumstances: '00',
        circumstancesPresumed: 0
        };

      for (const row of excelData.addedData) {
        const rowData = {
            speciesMentioned: row.data['eu_species'],
            sexMentioned: row.data['eu_sexCode'].toString().toUpperCase(),
            ageMentioned: row.data['eu_ageCode'].toString().toUpperCase(),
            date: row.data['date'],
            geographicalCoordinates: `${row.data['latitude']} ${row.data['longitude']}`,
            status: row.data['eu_statusCode'].toString().toUpperCase(),
            ringMentioned: row.data['ringNumber'],
            colorRing: row.data['colorRing'],
            placeName: row.data['place'],
            remarks: `${row.data['ringer'] || ''} ${row.data['remarks'] || ''}`
            };

          excelData.observations.push(Object.assign({}, rowData, defaults));
      }

      delete excelData.addedData;
  };

  /* eslint-disable-next-line class-methods-use-this */
  public async import(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { files } = req;
      const { type } = req.params;
      if (files.length !== 0) {
        // @ts-ignore
        for (const file of files) {
          const workbook: Workbook = await new Excel.Workbook().xlsx.load(file.buffer);
          const excelHeaders: HeaderCheck = await checkObservationsHeaderNames(workbook, type);

          if (excelHeaders.verified) {
            const checkedFormatData = await checkObservationImportedData(workbook);
            await this.checkEuRingCodes(checkedFormatData);
            await this.checkPossibleClones(checkedFormatData);
            await this.setXLSDataToObservation(checkedFormatData);
            delete checkedFormatData.validFormatData;

            res.send(checkedFormatData);
          } else {
            res.status(400).send({error: `Missing header titles: ${excelHeaders.errors.join(',')}`});
          }
        }
      } else {
        res.status(400).send({error: `No files detected`});
      }
    } catch (e) {
      next(e);
    }
  }
}
