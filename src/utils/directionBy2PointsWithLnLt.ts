interface GeoPoint {
  longitude: number;
  latitude: number;
}

export default (end: GeoPoint, start: GeoPoint): number | null => {
  if (!end.longitude || !end.latitude || !start.longitude || !start.latitude) return null;

  // φ, λ in radians
  const φ1 = (start.latitude * Math.PI) / 180;
  const φ2 = (end.latitude * Math.PI) / 180;
  const λ2 = (end.longitude * Math.PI) / 180;
  const λ1 = (start.longitude * Math.PI) / 180;

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360; // in degrees

  return bearing;
};
