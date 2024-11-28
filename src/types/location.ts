export interface Location {
  name: string;
  country: string;
  postcode: string;
  coordinates: [number, number];
  timezone: string;
  currency: string;
  countryCode: string;
}

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    country?: string;
    country_code?: string;
    postcode?: string;
  };
}