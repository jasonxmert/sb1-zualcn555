import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types/location';
import { searchLocation } from '../utils/geocoding';
import { debounce } from '../utils/debounce';

interface SplitMapProps {
  position: 'left' | 'right' | 'center';
  selectedLocation: Location | null;
  onLocationHover?: (lat: number, lon: number) => void;
  onLocationSelect?: (location: Location) => void;
}

interface HoverInfo {
  coordinates: [number, number];
  postcode?: string;
  address?: string;
}

// Custom marker icon
const customIcon = new L.DivIcon({
  className: 'custom-marker',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

function MapEvents({ onHover, onSelect }: { 
  onHover: (lat: number, lng: number) => void;
  onSelect: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    mousemove: (e) => {
      onHover(e.latlng.lat, e.latlng.lng);
    },
    click: (e) => {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

function MapController({ location }: { location: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.coordinates[1], location.coordinates[0]],
        14,
        { duration: 2 }
      );
    }
  }, [location, map]);

  return null;
}

export function SplitMap({ 
  position, 
  selectedLocation,
  onLocationHover,
  onLocationSelect 
}: SplitMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const debouncedFetchLocation = useCallback(
    debounce(async (lat: number, lon: number) => {
      try {
        const results = await searchLocation(`${lat},${lon}`);
        if (results.length > 0) {
          const result = results[0];
          setHoverInfo({
            coordinates: [lat, lon],
            postcode: result.address?.postcode || 'No postcode available',
            address: result.display_name.split(',')[0]
          });
        }
      } catch (error) {
        console.error('Error fetching hover location:', error);
      }
    }, 300),
    []
  );

  const handleHover = useCallback((lat: number, lng: number) => {
    if (onLocationHover) {
      onLocationHover(lat, lng);
    }
    debouncedFetchLocation(lat, lng);
  }, [onLocationHover, debouncedFetchLocation]);

  const handleSelect = useCallback(async (lat: number, lng: number) => {
    try {
      const results = await searchLocation(`${lat},${lng}`);
      if (results.length > 0 && onLocationSelect) {
        const result = results[0];
        const location: Location = {
          name: result.display_name.split(',')[0],
          country: result.address?.country || 'Unknown',
          postcode: result.address?.postcode || 'Unknown',
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
          timezone: 'UTC',
          currency: 'USD',
          countryCode: result.address?.country_code?.toUpperCase() || 'US'
        };
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  }, [onLocationSelect]);

  return (
    <div className="relative h-[700px] w-full rounded-xl overflow-hidden shadow-2xl border-2 border-gray-200">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        className="map-container"
        zoomControl={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          onload={() => setIsLoading(false)}
        />
        <MapEvents onHover={handleHover} onSelect={handleSelect} />
        <MapController location={selectedLocation} />
        {selectedLocation && (
          <Marker
            position={[selectedLocation.coordinates[1], selectedLocation.coordinates[0]]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-600">{selectedLocation.postcode}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {isLoading && (
        <div className="map-loading">
          <div className="map-loading-spinner" />
        </div>
      )}

      {hoverInfo && !isLoading && (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm space-y-1 z-[1000]">
          <p className="text-gray-700 font-medium">
            {hoverInfo.address}
          </p>
          <p className="text-gray-600">
            Postcode: {hoverInfo.postcode}
          </p>
          <p className="text-gray-500">
            Lat: {hoverInfo.coordinates[0].toFixed(6)}, Lon: {hoverInfo.coordinates[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}