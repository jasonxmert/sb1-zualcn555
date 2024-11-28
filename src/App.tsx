import React, { useState } from 'react';
import { Header } from './components/Header';
import { MapComponent } from './components/Map';
import { Footer } from './components/Footer';
import { Location, SearchResult } from './types/location';
import { getTimezone, getCurrency } from './utils/geocoding';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationSelect = (result: SearchResult) => {
    const coordinates: [number, number] = [parseFloat(result.lon), parseFloat(result.lat)];
    const timezone = getTimezone(parseFloat(result.lat), parseFloat(result.lon));
    const countryCode = result.address?.country_code?.toUpperCase() || 'US';
    
    setSelectedLocation({
      name: result.display_name.split(',')[0],
      country: result.address?.country || 'Unknown',
      postcode: result.address?.postcode || 'Unknown',
      coordinates,
      timezone,
      currency: getCurrency(countryCode),
      countryCode
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onLocationSelect={handleLocationSelect} />
      <main className="flex-1 flex flex-col">
        <MapComponent selectedLocation={selectedLocation} />
      </main>
      <Footer />
    </div>
  );
}

export default App;