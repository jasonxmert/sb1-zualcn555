import { SearchResult } from '../types/location';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const TIMEOUT_MS = 5000;
const RATE_LIMIT_MS = 1000;

let lastRequestTime = 0;

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

export async function searchLocation(query: string): Promise<SearchResult[]> {
  try {
    await waitForRateLimit();

    const params = new URLSearchParams({
      format: 'json',
      q: query,
      addressdetails: '1',
      limit: '5',
      accept_language: 'en'
    });

    const response = await fetch(`${NOMINATIM_API}/search?${params}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'PostcodeSearchApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<SearchResult | null> {
  try {
    await waitForRateLimit();

    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      addressdetails: '1',
      accept_language: 'en'
    });

    const response = await fetch(`${NOMINATIM_API}/reverse?${params}`, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'PostcodeSearchApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

export function getTimezone(lat: number, lon: number): string {
  try {
    // Calculate approximate timezone based on longitude
    const timezoneOffset = Math.round(lon / 15);
    const absoluteOffset = Math.abs(timezoneOffset);
    const sign = timezoneOffset >= 0 ? '+' : '-';
    const hours = absoluteOffset.toString().padStart(2, '0');
    return `UTC${sign}${hours}:00`;
  } catch (error) {
    console.error('Error calculating timezone:', error);
    return 'UTC';
  }
}

export function getCurrency(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'AU': 'AUD',
    'CA': 'CAD', 'JP': 'JPY', 'CN': 'CNY', 'IN': 'INR',
    'NZ': 'NZD', 'CH': 'CHF', 'SG': 'SGD', 'HK': 'HKD',
    'KR': 'KRW', 'BR': 'BRL', 'ZA': 'ZAR', 'RU': 'RUB',
    'MX': 'MXN', 'AE': 'AED'
  };
  
  return currencyMap[countryCode] || 'USD';
}