import { IProcessor } from 'typeorm-fixtures-cli';
import { RingingScheme } from '../entities/euring-codes/ringing-scheme-entity';

const ids = [
  'ABT',
  'AUW',
  'BGS',
  'BLB',
  'BYM',
  'CIJ',
  'CYC',
  'CYK',
  'CZP',
  'DEH',
  'DER',
  'DEW',
  'DKC',
  'ESA',
  'ESI',
  'ESS',
  'ETM',
  'FRP',
  'GBT',
  'GET',
  'GRA',
  'HES',
  'HGB',
  'HRZ',
  'IAB',
  'ILT',
  'ISR',
  'LID',
  'LIK',
  'LVR',
  'MEP',
  'MKS',
  'MLV',
  'NLA',
  'NOS',
  'PLG',
  'POL',
  'ROB',
  'RSB',
  'RUM',
  'SFH',
  'SKB',
  'SLL',
  'SVS',
  'TUA',
  'UKK',
];

const makeid = (i: number): string => ids[i];

/* eslint-disable class-methods-use-this */
export default class RingingSchemeProcessor implements IProcessor<RingingScheme> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g, ''), 10)),
      status: [null, '+', 'x'][Math.round(Math.random() * 10) % 3],
    };
  }
}
