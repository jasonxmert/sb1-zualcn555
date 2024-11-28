import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types/location';
import { reverseGeocode } from '../utils/geocoding';
import { debounce } from '../utils/debounce';
import { PinInfoCard } from './PinInfoCard';
import { MapPopup } from './MapPopup';

interface InteractiveMapProps {
  selectedLocation: Location | null;
}

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface HoverInfo {
  lat: number;
  lng: number;
  address?: string;
  postcode?: string;
}

function MapController({ location }: { location: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.coordinates[1], location.coordinates[0]],
        14,
        {
          duration: 1.5,
          easeLinearity: 0.25
        }
      );
    }
  }, [location, map]);

  return null;
}

function LocationMarker() {
  const map = useMap();
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const container = map.getContainer();
    if (container) {
      container.style.cursor = 'crosshair';
    }
  }, [map]);

  const debouncedUpdateLocationInfo = useCallback(
    debounce(async (lat: number, lng: number) => {
      try {
        const result = await reverseGeocode(lat, lng);
        if (result && result.display_name) {
          setHoverInfo({
            lat,
            lng,
            address: result.display_name.split(',')[0],
            postcode: result.address?.postcode
          });
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    }, 300),
    []
  );

  useMapEvents({
    mousemove: (e) => {
      const { lat, lng } = e.latlng;

      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }

      mouseMoveTimeoutRef.current = setTimeout(() => {
        setHoverInfo({ lat, lng });
        debouncedUpdateLocationInfo(lat, lng);
      }, 100);
    },
    mouseout: () => {
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
      setHoverInfo(null);
    }
  });

  useEffect(() => {
    return () => {
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [map]);

  return hoverInfo ? (
    <PinInfoCard
      lat={hoverInfo.lat}
      lng={hoverInfo.lng}
      address={hoverInfo.address}
      postcode={hoverInfo.postcode}
    />
  ) : null;
}

export function InteractiveMap({ selectedLocation }: InteractiveMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    setIsLoading(false);
  }, []);

  // Show popup initially when location is selected
  useEffect(() => {
    if (selectedLocation) {
      setShowPopup(true);
      
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }

      popupTimeoutRef.current = setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 100);
    }

    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [selectedLocation]);

  const handleMarkerRef = useCallback((marker: L.Marker | null) => {
    markerRef.current = marker;
    if (marker && selectedLocation) {
      // Add hover events to marker element
      const element = marker.getElement();
      if (element) {
        element.addEventListener('mouseenter', () => {
          setShowPopup(true);
          marker.openPopup();
        });
        element.addEventListener('mouseleave', () => {
          setShowPopup(false);
          marker.closePopup();
        });
      }
      marker.openPopup();
    }
  }, [selectedLocation]);

  return (
    <div className="relative h-[700px] w-full rounded-xl overflow-hidden shadow-2xl border-2 border-gray-200">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        className="h-full w-full"
        zoomControl={false}
        whenReady={e => handleMapReady(e.target)}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        <MapController location={selectedLocation} />
        {selectedLocation && (
          <Marker
            position={[selectedLocation.coordinates[1], selectedLocation.coordinates[0]]}
            icon={customIcon}
            ref={handleMarkerRef}
          >
            {showPopup && (
              <MapPopup
                location={selectedLocation}
                onMouseEnter={() => {
                  setShowPopup(true);
                  if (markerRef.current) {
                    markerRef.current.openPopup();
                  }
                }}
                onMouseLeave={() => {
                  setShowPopup(false);
                  if (markerRef.current) {
                    markerRef.current.closePopup();
                  }
                }}
              />
            )}
          </Marker>
        )}
      </MapContainer>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}