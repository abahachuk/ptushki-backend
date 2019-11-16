export interface Columns {
  [key: string]: string[];
  template: string[];
}

export const columns: Columns = {
  template: [
    'ringNumber',
    'colorRing',
    'sex',
    'eu_sexCode',
    'species',
    'eu_species',
    'status',
    'eu_statusCode',
    'date',
    'age',
    'eu_ageCode',
    'place',
    'eu_placeCode',
    'latitude',
    'longitude',
    'ringer',
    'remarks',
  ],
};
