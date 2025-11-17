/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Filter facilities by maximum distance from user location
 */
export function filterByProximity<T extends { lat: number; lng: number }>(
  facilities: T[],
  userLat: number,
  userLng: number,
  maxDistanceKm: number = 50
): T[] {
  return facilities.filter((facility) => {
    const distance = calculateDistance(userLat, userLng, facility.lat, facility.lng);
    return distance <= maxDistanceKm;
  });
}

/**
 * Sort facilities by distance from user location (nearest first)
 */
export function sortByDistance<T extends { lat: number; lng: number }>(
  facilities: T[],
  userLat: number,
  userLng: number
): T[] {
  return [...facilities].sort((a, b) => {
    const distanceA = calculateDistance(userLat, userLng, a.lat, a.lng);
    const distanceB = calculateDistance(userLat, userLng, b.lat, b.lng);
    return distanceA - distanceB;
  });
}
