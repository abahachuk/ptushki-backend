import * as entities from '../../entities/euring-codes';

export type EuringAccessTable =
  | 'Accuracy_of_coordinates'
  | 'Accuracy_of_date'
  | 'Accuracy_of_pullus_age'
  | 'Age'
  | 'Broodsize'
  | 'Catching_method'
  | 'Cathing_lures'
  | 'Circumstances'
  | 'Circumstances_presumed'
  | 'Condition'
  | 'Euring_cod_identifier'
  | 'Manipulated'
  | 'Metal_ring_information'
  | 'Moved_before_the_capture'
  | 'Other_marks_information_EUR'
  | 'Place_code_n'
  | 'Primary_identification_mehod'
  | 'Pullus_age'
  | 'Ringing_schem'
  | 'Sex'
  | 'Species'
  | 'Status'
  | 'Status_of_ring'
  | 'Verification_of_the_metal_ring';

/* eslint-disable @typescript-eslint/camelcase */
export const EURINGs: { [index in EuringAccessTable]: { Entity: any; mapping: Map<string, string> } } = {
  Accuracy_of_coordinates: {
    Entity: entities.AccuracyOfCoordinates,
    mapping: new Map([
      ['id', 'n'],
      ['desc_eng', 'Acccuracy of co-ordinates'],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Accuracy_of_date: {
    Entity: entities.AccuracyOfDate,
    mapping: new Map([['id', 'n'], ['desc_eng', 'AoD'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Accuracy_of_pullus_age: {
    Entity: entities.AccuracyOfPullusAge,
    mapping: new Map([
      ['id', 'Eur_acc_pull_age'],
      ['desc_eng', 'Accuracy of pullus age'],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Age: {
    Entity: entities.Age,
    mapping: new Map([['id', 'Eur-n'], ['desc_eng', 'Age'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Broodsize: {
    Entity: entities.BroodSize,
    mapping: new Map([['id', 'EC'], ['desc_eng', 'Broodsize'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Catching_method: {
    Entity: entities.CatchingMethod,
    mapping: new Map([
      ['id', 'Eur_cathng method'],
      ['desc_eng', 'Catching method'],
      ['desc_rus', 'RUS'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Cathing_lures: {
    Entity: entities.CatchingLures,
    mapping: new Map([
      ['id', 'Eur_cathing_lures'],
      ['desc_eng', 'Catching lures'],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Circumstances: {
    Entity: entities.Circumstances,
    mapping: new Map([['id', 'Eur-n'], ['desc_eng', 'Обстоятельства'], ['desc_rus', 'Rus']]),
  },
  Circumstances_presumed: {
    Entity: entities.CircumstancesPresumed,
    mapping: new Map([
      ['id', 'Eur_presumed'],
      ['desc_eng', 'Circumstances presumed'],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  // Color_ring_information: { Entity: entities }, // FIXME невозможно заставить эту таблицу работать через node-adodb
  // ну и как бы она отсутствует в стандарте. скорее всего здесь она вспомогательная
  Condition: {
    Entity: entities.Condition,
    mapping: new Map([['id', 'n'], ['desc_eng', 'Condition'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Euring_cod_identifier: {
    Entity: entities.EURINGCodeIdentifier,
    mapping: new Map([['id', 'EC'], ['desc_eng', 'Euring code identifier'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Manipulated: {
    Entity: entities.Manipulated,
    mapping: new Map([
      ['id', 'Eur_manipulated'],
      ['desc_eng', 'Manipulated'],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Metal_ring_information: {
    Entity: entities.MetalRingInformation,
    mapping: new Map([
      ['id', 'Eur_metl_ring_inform'],
      ['desc_eng', 'Metal ring informtion '],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Moved_before_the_capture: {
    Entity: entities.MovedBeforeTheCapture,
    mapping: new Map([
      ['id', 'Eur_moved'],
      ['desc_eng', 'Moved befor the capture'],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Other_marks_information_EUR: {
    Entity: entities.OtherMarksInformation,
    mapping: new Map([['id', 'Eur-cod'], ['desc_eng', 'Descr'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Place_code_n: {
    Entity: entities.PlaceCode,
    mapping: new Map([['id', 'Euring_cod'], ['country', 'Country'], ['region', 'Region']]),
  },
  Primary_identification_mehod: {
    Entity: entities.PrimaryIdentificationMethod,
    mapping: new Map([
      ['id', 'Eur-cod'],
      ['desc_eng', 'Primry identification method'],
      ['desc_rus', 'Rus'],
      ['desc_byn', 'Bel'],
    ]),
  },
  Pullus_age: {
    Entity: entities.PullusAge,
    mapping: new Map([['id', 'EC'], ['desc_eng', 'Pullus age'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Ringing_schem: {
    Entity: entities.RingingScheme,
    mapping: new Map([['id', 'Eur-cod'], ['status', 'Status'], ['country', 'Country'], ['region', 'region']]),
  },
  Sex: {
    Entity: entities.Sex,
    mapping: new Map([['id', 'Eur-n'], ['desc_eng', 'Sex'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Species: {
    Entity: entities.Species,
    mapping: new Map([
      ['id', 'EURING CODE'],
      ['letterCode', '6L CODE'],
      ['species', 'SPECIES'],
      ['ordo', 'ORDO'],
      ['family', 'FAMILY'],
      ['desc_eng', 'ENGLISH'],
      ['desc_rus', 'RUSSIAN'],
    ]),
  },
  Status: {
    Entity: entities.Status,
    mapping: new Map([['id', 'Eur_status'], ['desc_eng', 'Stautus'], ['desc_rus', 'Rus'], ['desc_byn', 'Bel']]),
  },
  Status_of_ring: {
    Entity: entities.StatusOfRing,
    mapping: new Map([['id', 'Statys'], ['desc_eng', 'Description']]),
  },
  Verification_of_the_metal_ring: {
    Entity: entities.VerificationOfTheMetalRing,
    mapping: new Map([
      ['id', 'Eur_Verifiction'],
      ['desc_eng', 'Verification of the ,etal ring'],
      ['desc_rus', 'rus'],
      ['desc_byn', 'bel'],
    ]),
  },
};

export function mapEURINGCode(table: EuringAccessTable, tableRecords: any[]): any[] {
  const { Entity, mapping } = EURINGs[table];
  const keys: string[] = [...mapping.keys()];
  return tableRecords.map((item: { [index: string]: any }) =>
    Object.assign(
      new Entity(),
      keys.reduce((acc: { [index: string]: string }, key: string) => {
        const value = item[mapping.get(key) as string];
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {}),
    ),
  );
}
