export interface Columns {
  [key: string]: string[];
  'validate-xls': string[];
}

export const columns: Columns = {
  'validate-xls': [
    'ringNumber',
    'colorRing',
    'eu_sexCode',
    'eu_species',
    'eu_statusCode',
    'date',
    'eu_ageCode',
    'eu_placeCode',
    'latitude',
    'longitude',
    'ringer',
    'remarks',
  ],
};
