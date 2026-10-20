// EXPO_PUBLIC_* values are inlined into the JS bundle at build time, so anyone can
// extract this key from the app. That's fine for a demo. In production, call the API
// through your own backend and keep the key on the server.
export const API_KEY = (process.env.EXPO_PUBLIC_NATIONAL_ADDRESS_API_KEY ?? '').trim();

export const IS_MOCK = API_KEY.length === 0;

export const BASE_URL = 'https://apina.address.gov.sa/NationalAddress/v3.1';

export const REQUEST_TIMEOUT_MS = 15_000;

// Starter subscription: 5 calls / minute, 100 calls / week.
export const CALLS_PER_MINUTE = 5;

export const CACHE_TTL_MS = 10 * 60 * 1000;

// Riyadh, the sample point used throughout the official docs.
export const DEFAULT_COORDINATE = { latitude: 24.647414, longitude: 46.714241 };
