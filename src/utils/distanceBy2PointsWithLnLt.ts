interface GeoPoint {
  longitude: number | null;
  latitude: number | null;
}

export default (end: GeoPoint, start: GeoPoint): number | null => {
  if (!end.longitude || !end.latitude || !start.longitude || !start.latitude) return null;

  const R = 6371e3; // Earth radius - metres
  const φ1 = (start.latitude * Math.PI) / 180; // φ, λ in radians
  const φ2 = (end.latitude * Math.PI) / 180;
  const Δφ = ((end.latitude - start.latitude) * Math.PI) / 180;
  const Δλ = ((end.longitude - start.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance / 1000;
};
