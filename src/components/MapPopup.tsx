import React from 'react';
import { Popup } from 'react-leaflet';
import { Location } from '../types/location';
import { formatTimeWithZone } from '../utils/timezone';

interface MapPopupProps {
  location: Location;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MapPopup({ location, onMouseEnter, onMouseLeave }: MapPopupProps) {
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <Popup
      closeButton={false}
      closeOnClick={false}
      autoPan={true}
      className="custom-popup"
      offset={[0, -20]}
      autoClose={false}
    >
      <div 
        className="popup-content p-3 w-[260px]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
          <span className="text-2xl">{getFlagEmoji(location.countryCode)}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
            <p className="text-xs text-gray-500 truncate">{location.country} ({location.postcode})</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm bg-red-50 p-2 rounded-lg">
            <span className="text-lg">📍</span>
            <span className="text-gray-700">
              {location.coordinates[1].toFixed(4)}, {location.coordinates[0].toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded-lg">
            <span className="text-lg">⏰</span>
            <span className="text-gray-700">{formatTimeWithZone(new Date(), location.timezone)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded-lg">
            <span className="text-lg">💰</span>
            <span className="text-gray-700">{location.currency}</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-yellow-50 p-2 rounded-lg">
            <span className="text-lg">🌐</span>
            <span className="text-gray-700">.{location.countryCode.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </Popup>
  );
}