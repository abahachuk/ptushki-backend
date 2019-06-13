export interface DecimalCoordinates {
  latitude: number;
  longitude: number;
}

function fromEuringHelper(degrees: number, minutes: number, seconds: number, isNegative: boolean): number {
  const count = Number((degrees + minutes / 60 + seconds / (60 * 60)).toFixed(6));
  return isNegative ? count * -1 : count;
}

export const fromEuringToDecimal = (coords: string): DecimalCoordinates => {
  try {
    if (coords && coords.length === 15) {
      const latitude = fromEuringHelper(
        Number(coords.slice(1, 3)),
        Number(coords.slice(3, 5)),
        Number(coords.slice(5, 7)),
        coords[0] === '-',
      );
      const longitude = fromEuringHelper(
        Number(coords.slice(8, 11)),
        Number(coords.slice(11, 13)),
        Number(coords.slice(13, 15)),
        coords[7] === '-',
      );
      return { latitude, longitude };
    }
    throw new Error('Incorrect format of coordinates');
  } catch (err) {
    throw new Error(err.message || 'Incorrect format of coordinates');
  }
};

function fromDecimalHelper(coordinate: number, isLng?: boolean): string {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  return `${String(degrees).padStart(isLng ? 3 : 2, '0')}${String(minutes).padStart(2, '0')}${String(seconds).padStart(
    2,
    '0',
  )}`;
}

export const fromDecimalToEuring = (latitude: string, longitude: string): string => {
  try {
    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);
    const startLat = latitudeNumber >= 0 ? '+' : '-';
    const startLng = longitudeNumber >= 0 ? '+' : '-';
    return `${startLat}${fromDecimalHelper(latitudeNumber)}${startLng}${fromDecimalHelper(longitudeNumber, true)}`;
  } catch {
    throw new Error('Incorrect format of coordinates');
  }
};
