const fillZeros = (int: number | string, length: number): string => String(int).padStart(length, '0');

export const fromDateToEuringDate = (date: Date | null): string => {
  if (typeof date === 'string') {
    const convertedDate = new Date(date);
    return `${fillZeros(convertedDate.getDate(), 2)}${fillZeros(
      convertedDate.getMonth() + 1,
      2,
    )}${convertedDate.getFullYear()}`;
  }
  return '--------';
};

export const fromDateToEuringTime = (date: Date | null): string => {
  if (typeof date === 'string') {
    const convertedDate = new Date(date);
    return `${fillZeros(convertedDate.getHours(), 2)}--`;
  }
  return '----';
};

const getCurrNum = (str: string, from?: number, to?: number): number => Number(str.slice(from, to).replace(/-/g, '0'));

export const fromEuringToDate = (dateString: string, timeString: string): Date | null => {
  if (!getCurrNum(dateString)) {
    return null;
  }
  const date = new Date();
  date.setDate(getCurrNum(dateString, 0, 2));
  date.setMonth(getCurrNum(dateString, 2, 4) - 1);
  date.setFullYear(getCurrNum(dateString, 4, 8));
  date.setHours(getCurrNum(timeString, 0, 2));
  date.setMinutes(getCurrNum(timeString, 2, 4));
  return date;
};
