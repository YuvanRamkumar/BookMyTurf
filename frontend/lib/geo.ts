/**
 * Haversine formula to calculate distance between two GPS coordinates
 * Returns distance in kilometers
 */
export function calculateDistance(
    userLat: number,
    userLng: number,
    turfLat: number,
    turfLng: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(turfLat - userLat);
    const dLng = toRad(turfLng - userLng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLat)) *
        Math.cos(toRad(turfLat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m away`;
    }
    return `${km.toFixed(1)} km away`;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        !(lat === 0 && lng === 0) // 0,0 means not set
    );
}

/**
 * Generate Google Maps directions URL
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Generate Google Maps embed URL (no API key needed)
 */
export function getGoogleMapsEmbedUrl(lat: number, lng: number): string {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}
