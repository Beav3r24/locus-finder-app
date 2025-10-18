// Google Maps API Configuration
// IMPORTANT: Restrict this API key in Google Cloud Console:
// 1. For web: Add your domain to HTTP referrer restrictions
// 2. For Android: Add your app's SHA-1 fingerprint and package name
// 3. For iOS: Add your app's bundle identifier
// Learn more: https://developers.google.com/maps/api-security-best-practices

export const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';

// High accuracy location options for precise tracking
export const HIGH_ACCURACY_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};
