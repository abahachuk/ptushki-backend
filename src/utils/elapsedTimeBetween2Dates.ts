interface TimePoint {
  date: Date | null;
}

export default (end: TimePoint, start: TimePoint): number | null => {
  if (!end.date || !start.date || !(end.date instanceof Date) || !(start.date instanceof Date)) return null;
  const msInDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end.date.getTime() - start.date.getTime()) / msInDay);
};
