"use client";

import { useState, useEffect, useRef } from "react";
import { City } from "@/type/City";
import useOracle from "@/hook/useOracle";
import useContract from "@/hook/useContract";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface CreateOracleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOracleModal({ isOpen, onClose, onSuccess }: CreateOracleModalProps) {
  const account = useCurrentAccount();
  const { searchCity, createOracle, oracleLoading } = useOracle();
  const { contractLoading } = useContract({ address: account?.address });

  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [targetTemp, setTargetTemp] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setCities([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchCity(searchQuery);
        setCities(results);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search failed:", error);
        setCities([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setSearchQuery(`${city.name}, ${city.state ? city.state + ', ' : ''}${city.country}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity || !targetTemp || !targetDate || !targetTime) {
      alert("Please fill in all fields");
      return;
    }

    const temp = parseFloat(targetTemp);
    if (isNaN(temp)) {
      alert("Invalid temperature");
      return;
    }

    // Combine date and time into timestamp (milliseconds)
    const dateTime = new Date(`${targetDate}T${targetTime}`);
    const timestamp = dateTime.getTime();

    try {
      await createOracle(
        selectedCity.name,
        selectedCity.lat,
        selectedCity.lon,
        timestamp,
        temp
      );
      
      // Reset form
      setSearchQuery("");
      setSelectedCity(null);
      setTargetTemp("");
      setTargetDate("");
      setTargetTime("");
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create oracle:", error);
      alert("Failed to create oracle. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Create Weather Oracle</h2>
              <p className="text-blue-100 text-sm">Set up a new weather prediction challenge</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* City Search */}
          <div className="mb-6 relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Search City
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => cities.length > 0 && setShowDropdown(true)}
                placeholder="Search for a city..."
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && cities.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                {cities.map((city, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between group border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {city.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {city.state && `${city.state}, `}{city.country}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 text-right shrink-0">
                      <div>Lat: {city.lat.toFixed(2)}</div>
                      <div>Lon: {city.lon.toFixed(2)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected City Display */}
            {selectedCity && (
              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      Selected: {selectedCity.name}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedCity.state && `${selectedCity.state}, `}{selectedCity.country}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Coordinates: {selectedCity.lat.toFixed(4)}, {selectedCity.lon.toFixed(4)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity(null);
                      setSearchQuery("");
                    }}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Target Temperature */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Target Temperature (°C)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={targetTemp}
                onChange={(e) => setTargetTemp(e.target.value)}
                placeholder="e.g., 25.5"
                className="w-full px-4 pr-12 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold pointer-events-none">
                °C
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Time
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Preview */}
          {selectedCity && targetTemp && targetDate && targetTime && (
            <div className="mb-6 p-4 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Preview</h4>
              <div className="text-sm space-y-1 text-purple-800 dark:text-purple-200">
                <p><span className="font-medium">City:</span> {selectedCity.name}, {selectedCity.country}</p>
                <p><span className="font-medium">Temperature:</span> {targetTemp}°C</p>
                <p><span className="font-medium">Date & Time:</span> {new Date(`${targetDate}T${targetTime}`).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all"
              disabled={oracleLoading || contractLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedCity || !targetTemp || !targetDate || !targetTime || oracleLoading || contractLoading}
              className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {oracleLoading || contractLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Oracle
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
