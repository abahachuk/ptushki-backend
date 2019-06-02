import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import { getNames } from 'country-list';
import AbstractController from './abstract-controller';
import { Species } from '../entities/euring-codes/species-entity';
import { Age } from '../entities/euring-codes/age-entity';
import { Status } from '../entities/euring-codes/status-entity';
import { Sex } from '../entities/euring-codes/sex-entity';
import { MetalRingInformation } from '../entities/euring-codes/metal-ring-information-entity';
import { OtherMarksInformation } from '../entities/euring-codes/other-marks-information-entity';
import { PlaceCode } from '../entities/euring-codes';

export default class ObservationController extends AbstractController {
  private router: Router;

  private species: Repository<Species>;

  private age: Repository<Age>;

  private sex: Repository<Sex>;

  private status: Repository<Status>;

  private metalRingInformation: Repository<MetalRingInformation>;

  private otherMarksInformation: Repository<OtherMarksInformation>;

  private placeCode: Repository<PlaceCode>;

  public init(): Router {
    this.router = Router();
    this.species = getRepository(Species);
    this.age = getRepository(Age);
    this.sex = getRepository(Sex);
    this.status = getRepository(Status);
    this.metalRingInformation = getRepository(MetalRingInformation);
    this.otherMarksInformation = getRepository(OtherMarksInformation);
    this.placeCode = getRepository(PlaceCode);
    this.router.get('/', this.getCatalog);
    return this.router;
  }

  private getCatalog = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const speciesPromise = this.species.find({
        select: ['id', 'species', 'family', 'letterCode', 'desc_rus', 'desc_eng', 'desc_byn'],
      });
      const sexPromise = this.sex.find({ select: ['id', 'desc_rus', 'desc_eng', 'desc_byn'] });
      const agePromise = this.age.find({ select: ['id', 'desc_rus', 'desc_eng', 'desc_byn'] });
      const statusPromise = this.status.find({ select: ['id', 'desc_rus', 'desc_eng', 'desc_byn'] });
      const metalRingInformationPromise = this.metalRingInformation.find({
        select: ['id', 'desc_rus', 'desc_eng', 'desc_byn'],
      });
      const otherMarksInformationPromise = this.otherMarksInformation.find({
        select: ['id', 'desc_rus', 'desc_eng', 'desc_byn'],
      });
      const placeCodePromise = this.placeCode.find({
        select: ['id', 'country', 'region'],
      });
      const [species, sex, age, status, metalRingInformation, otherMarksInformation, placeCode] = await Promise.all([
        speciesPromise,
        sexPromise,
        agePromise,
        statusPromise,
        metalRingInformationPromise,
        otherMarksInformationPromise,
        placeCodePromise,
      ]);
      res.json({
        species,
        sex,
        age,
        status,
        metalRingInformation,
        otherMarksInformation,
        placeCode,
        allCountries: getNames(),
      });
    } catch (error) {
      next(error);
    }
  };
}
