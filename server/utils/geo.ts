// Geospatial utility functions for distance and ETA calculations

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Compute estimated time of arrival (ETA) in milliseconds
 * @param lat1 - Start latitude
 * @param lon1 - Start longitude
 * @param lat2 - Destination latitude
 * @param lon2 - Destination longitude
 * @param speedKmh - Average speed in km/h (default: 40)
 * @returns ETA in milliseconds
 */
export function computeETA_MS(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  speedKmh: number = 40
): number {
  const distanceMeters = haversineDistanceMeters(lat1, lon1, lat2, lon2);
  const speedMs = (speedKmh * 1000) / 3600; // Convert km/h to m/s

  if (speedMs <= 0) return Infinity;

  const etaSeconds = distanceMeters / speedMs;
  return Math.round(etaSeconds * 1000); // Convert to milliseconds
}

/**
 * Format ETA in milliseconds to human-readable string
 * @param etaMs - ETA in milliseconds
 * @returns Formatted string like "5 mins" or "1 hr 23 mins"
 */
export function formatETA(etaMs: number): string {
  if (!isFinite(etaMs)) return "Unknown";

  const totalMinutes = Math.round(etaMs / 60000);
  if (totalMinutes < 60) {
    return `${totalMinutes} min${totalMinutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`;
}

/**
 * Parse coordinate string to number
 * @param coord - Coordinate as string
 * @returns Coordinate as number
 */
export function parseCoordinate(coord: string | number | null | undefined): number {
  if (typeof coord === "number") return coord;
  if (!coord) return 0;
  const parsed = parseFloat(coord);
  return isNaN(parsed) ? 0 : parsed;
}
