import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getRepository, Repository } from 'typeorm';
import Excel, { Workbook } from 'exceljs';
import { HeaderCheck, DataCheck, createExcelWorkBook, checkHeaderNames, checkImportedData } from '../services/import';
import { Status } from '../entities/euring-codes/status-entity';
import { Age } from '../entities/euring-codes/age-entity';
import { Sex } from '../entities/euring-codes/sex-entity';
import { Species } from '../entities/euring-codes/species-entity';

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void => {
    const ext = path.extname(file.originalname);

    if (ext === '.xlsx' || ext === '.xls') {
      callback(null, true);
    } else {
      callback(new Error('Incorrect file extension'), false);
    }
  },
}).single('file');

export default class ImportController {
  private router: Router;

  private status: Repository<Status>;

  private age: Repository<Age>;

  private sex: Repository<Sex>;

  private species: Repository<Species>;

  public init(): Router {
    this.router = Router();
    this.status = getRepository(Status);
    this.age = getRepository(Age);
    this.sex = getRepository(Sex);
    this.species = getRepository(Species);

    this.router.get('/template', this.getImportTemplate);
    this.router.post('/file', this.parseImportFile);
    return this.router;
  }

  private getImportTemplate = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workBook = await createExcelWorkBook('template');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Observations.xlsx');

      workBook.xlsx
        .write(res)
        .then(
          (): void => {
            res.end();
          },
        )
        .catch(
          (error: Error): void => {
            next(error);
          },
        );
    } catch (error) {
      next(error);
    }
  };

  private parseImportFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    upload(
      req,
      res,
      (err: Error): void => {
        if (err) {
          next(err);
        }

        try {
          const workbook: Workbook = new Excel.Workbook();
          workbook.xlsx
            .load(req.file.buffer)
            .then(
              async (wb: Workbook): Promise<void> => {
                const importType = 'import';
                const result: HeaderCheck = await checkHeaderNames(wb, importType);

                if (result.verified) {
                  const data = await checkImportedData(wb);

                  await this.checkEuRingCodes(data);
                  await this.checkPossibleClones(data);
                  delete data.validFormatData;

                  res.send(data);
                } else {
                  res.status(400).send({ error: `Incorrect header titles: ${result.errors.join(',')}` });
                }
              },
            )
            .catch(
              (error: Error): void => {
                next(error);
              },
            );
        } catch (e) {
          next(e);
        }
      },
    );
  };

  private checkEuRingCodes = async (data: DataCheck): Promise<void> => {
    let rowStatus = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const row of data.validFormatData) {
      // @ts-ignore
      const rowData = row.data;
      if (rowData) {
        // eslint-disable-next-line no-await-in-loop
        const status = await this.status.find({ id: rowData.eu_statusCode.toLowerCase() });
        // eslint-disable-next-line no-await-in-loop
        const speciesMentioned = await this.species.find({ id: rowData.eu_species.toLowerCase() });
        // eslint-disable-next-line no-await-in-loop
        const sexMentioned = await this.sex.find({ id: rowData.eu_sexCode.toLowerCase() });
        // eslint-disable-next-line no-await-in-loop
        const ageMentioned = await this.age.find({ id: rowData.eu_ageCode.toLowerCase() });

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
          rowStatus = { verifiedEuRingCodes: false, error: `Can not find euRing codes: ${euCodeErrors.join(',')}` };
          // @ts-ignore
          data.euRingErrors.push({ rowNumber: row.rowNumber, status: rowStatus });
        } else {
          data.addedData.push(row);
          rowStatus = { verifiedEuRingCodes: true, error: null };
        }
      }
    }
  };

  private checkPossibleClones = async (data: DataCheck): Promise<void> => {
    // eslint-disable-next-line no-restricted-syntax
    for (const row of data.addedData) {
      // @TODO
      console.log(row);
    }
  };
}
