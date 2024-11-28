import React from 'react';
import { SearchBar } from './SearchBar';
import { SearchResult } from '../types/location';

interface HeaderProps {
  onLocationSelect: (result: SearchResult) => void;
}

export function Header({ onLocationSelect }: HeaderProps) {
  return (
    <header className="bg-gray-800 text-white py-6 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">Search By Postcode</h1>
        <p className="text-gray-300 mb-6 text-center">Find postcodes using different search methods</p>
        <div className="max-w-2xl mx-auto">
          <SearchBar 
            onLocationSelect={onLocationSelect} 
            placeholder="Search by postcode, country, city or location..." 
          />
        </div>
      </div>
    </header>
  );
}