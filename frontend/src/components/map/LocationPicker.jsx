import { useState, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import MapView from './MapView';
import toast from 'react-hot-toast';
import { MdMyLocation, MdSearch } from 'react-icons/md';

function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

function LocationPicker({ onLocationSelect, initialLocation, height = "400px" }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleMapClick = async (lat, lng) => {
    const location = { lat, lng };
    setSelectedLocation(location);
    
    try {
      const address = await reverseGeocode(lat, lng);
      const fullLocation = { ...location, ...address };
      setSelectedLocation(fullLocation);
      onLocationSelect(fullLocation);
    } catch (error) {
      toast.error('Failed to get address for this location');
      onLocationSelect(location);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    toast.loading('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        toast.dismiss();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await handleMapClick(lat, lng);
        toast.success('Location detected!');
      },
      (error) => {
        toast.dismiss();
        if (error.code === 1) {
          toast.error('Location permission denied. Please enable location access.');
        } else if (error.code === 2) {
          toast.error('Unable to determine your location.');
        } else {
          toast.error('Location request timed out.');
        }
      }
    );
  };

  const searchAddress = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        {
          headers: {
            'User-Agent': 'Feasto-Food-Delivery/1.0'
          }
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      toast.error('Failed to search address');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchSelect = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchResults([]);
    setSearchQuery('');
    await handleMapClick(lat, lng);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'Feasto-Food-Delivery/1.0'
          }
        }
      );
      const data = await response.json();
      return {
        address: data.display_name,
        street: data.address?.road || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        postalCode: data.address?.postcode || ''
      };
    } catch (error) {
      throw new Error('Reverse geocoding failed');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchAddress]);

  const center = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [28.6139, 77.2090];

  const markers = selectedLocation
    ? [{ id: 'selected', position: [selectedLocation.lat, selectedLocation.lng], popup: 'Delivery Location' }]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 relative z-[1001]">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <MdSearch className="text-gray-400 text-lg" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for an address..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition relative z-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="absolute z-[1002] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchSelect(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 cursor-pointer"
                >
                  <p className="text-xs text-gray-900">{result.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleUseCurrentLocation}
          className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-1.5 z-10 cursor-pointer text-sm whitespace-nowrap"
        >
          <MdMyLocation className="text-base" />
          <span className="text-xs">Use My Location</span>
        </button>
      </div>

      <div className="relative z-[1000]">
        <MapView
          center={center}
          zoom={selectedLocation ? 15 : 13}
          height={height}
          markers={markers}
          onMapClick={handleMapClick}
        >
          <MapUpdater center={center} zoom={selectedLocation ? 15 : 13} />
        </MapView>
      </div>
    </div>
  );
}

export default LocationPicker;
