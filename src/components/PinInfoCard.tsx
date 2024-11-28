import React from 'react';
import { MapPin } from 'lucide-react';

interface PinInfoCardProps {
  lat: number;
  lng: number;
  address?: string;
  postcode?: string;
}

export function PinInfoCard({ lat, lng, address, postcode }: PinInfoCardProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-[9999] max-w-md">
      <div className="space-y-2">
        {address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <p className="text-sm font-medium text-gray-700 truncate">
              {address}
            </p>
          </div>
        )}
        {postcode && (
          <p className="text-sm text-gray-600 pl-6">
            Postcode: {postcode}
          </p>
        )}
        <p className="text-xs text-gray-500 pl-6">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
}