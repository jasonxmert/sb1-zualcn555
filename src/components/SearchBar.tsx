import React, { useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { SearchResult } from '../types/location';
import { useDebounce } from '../hooks/useDebounce';
import { searchLocation } from '../utils/geocoding';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface SearchBarProps {
  onLocationSelect: (location: SearchResult) => void;
  placeholder?: string;
}

export function SearchBar({ onLocationSelect, placeholder = "Search for a location..." }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchLocation(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  };

  const handleSelectResult = useCallback((result: SearchResult) => {
    onLocationSelect(result);
    setSearchResults([]);
    setSearchQuery('');
    setSelectedIndex(-1);
  }, [onLocationSelect]);

  const { handleKeyDown } = useKeyboardNavigation({
    itemCount: searchResults.length,
    selectedIndex,
    setSelectedIndex,
    onSelect: () => {
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    },
    onEscape: () => {
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  });

  const getFlagEmoji = (countryCode?: string) => {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    try {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
      
      return parts.map((part, i) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return isMatch ? (
          <span key={i} className="bg-blue-100 text-blue-900 font-medium">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        );
      });
    } catch (error) {
      console.error('Error highlighting match:', error);
      return text;
    }
  };

  const getLocationDetails = (displayName: string) => {
    const parts = displayName.split(', ');
    return {
      mainText: parts[0],
      secondaryText: parts.slice(1).join(', ')
    };
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-2 pl-10 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 backdrop-blur-sm"
            role="combobox"
            aria-expanded={searchResults.length > 0}
            aria-controls="search-results"
            aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {searchResults.length > 0 && (
        <div
          ref={resultsRef}
          id="search-results"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[340px] overflow-y-auto divide-y divide-gray-100"
        >
          {searchResults.map((result, index) => {
            const { mainText, secondaryText } = getLocationDetails(result.display_name);
            return (
              <button
                key={index}
                role="option"
                id={`result-${index}`}
                aria-selected={index === selectedIndex}
                onClick={() => handleSelectResult(result)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                  index === selectedIndex ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {getFlagEmoji(result.address?.country_code)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {highlightMatch(mainText, searchQuery)}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {highlightMatch(secondaryText, searchQuery)}
                    </p>
                    {result.address?.postcode && (
                      <p className="text-sm text-indigo-600 font-medium mt-0.5">
                        Postcode: {highlightMatch(result.address.postcode, searchQuery)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}