import { IProcessor } from 'typeorm-fixtures-cli';
import { OtherMarksInformation } from '../entities/euring-codes';

const permanentMarks = 'BCDEFGHKL';
// const temporaryMarks = 'are skipped';
const secondCharacter = 'BCDE-';
const specialCases = ['MM', 'OM', 'OP', 'OT', 'ZZ'];

const ids: string[] = [...permanentMarks]
  .map(p => [...secondCharacter].map(s => p + s))
  .reduce((a, b) => a.concat(b))
  .concat(specialCases);

const makeid = (i: number): string => ids[i];

export default class OtherMarksInformationProcessor implements IProcessor<OtherMarksInformation> {
  /* eslint-disable class-methods-use-this */
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g, ''), 10)),
    };
  }
}
