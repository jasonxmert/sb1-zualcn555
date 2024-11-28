import React from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { MapPin, Clock, Globe, DollarSign, Flag, Mail } from 'lucide-react';

interface Location {
  name: string;
  country: string;
  postcode: string;
  coordinates: [number, number];
  timezone: string;
  currency: string;
  countryCode: string;
}

interface LocationDetailsProps {
  location: Location;
}

export function LocationDetails({ location }: LocationDetailsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-blue-500" />
        {location.name}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <DetailCard
          icon={<MapPin className="h-5 w-5 text-blue-500" />}
          label="Coordinates"
          value={`${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}`}
        />
        <DetailCard
          icon={<Mail className="h-5 w-5 text-purple-500" />}
          label="Postcode"
          value={location.postcode}
        />
        <DetailCard
          icon={<Flag className="h-5 w-5 text-red-500" />}
          label="Country"
          value={`${location.country} (${location.countryCode})`}
        />
        <DetailCard
          icon={<Clock className="h-5 w-5 text-green-500" />}
          label="Local Time"
          value={formatInTimeZone(new Date(), location.timezone, 'HH:mm:ss')}
        />
        <DetailCard
          icon={<DollarSign className="h-5 w-5 text-yellow-500" />}
          label="Currency"
          value={location.currency}
        />
        <DetailCard
          icon={<Globe className="h-5 w-5 text-indigo-500" />}
          label="Domain"
          value={`.${location.countryCode.toLowerCase()}`}
        />
      </div>
    </div>
  );
}

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailCard({ icon, label, value }: DetailCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 transition-all hover:bg-gray-100">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}