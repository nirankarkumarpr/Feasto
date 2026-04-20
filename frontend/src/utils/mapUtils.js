import L from 'leaflet';
import deliveryIconImg from '../assets/deliveryIcon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom map icons
export const customerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 14 9 14s9-8.75 9-14c0-4.97-4.03-9-9-9z" fill="#FF6B35"/>
      <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [14, 52]
});

export const deliveryIcon = new L.Icon({
  iconUrl: deliveryIconImg,
  iconSize: [38, 38],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
  shadowUrl: markerShadow,
  shadowSize: [90, 50],
  shadowAnchor: [40, 38]
});

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // Returns distance in kilometers
};

// Convert degrees to radians
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distanceInKm) => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(2)} km`;
};

// Calculate estimated time of arrival (ETA)
// Assumes average speed of 30 km/h for delivery
export const calculateETA = (distanceInKm, averageSpeedKmh = 30) => {
  const timeInHours = distanceInKm / averageSpeedKmh;
  const timeInMinutes = Math.round(timeInHours * 60);
  
  if (timeInMinutes < 1) {
    return "Less than 1 min";
  }
  
  if (timeInMinutes < 60) {
    return `${timeInMinutes} min`;
  }
  
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = timeInMinutes % 60;
  return `${hours}h ${minutes}m`;
};

// Validate coordinates
export const validateCoordinates = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }
  
  if (lat < -90 || lat > 90) {
    return false;
  }
  
  if (lng < -180 || lng > 180) {
    return false;
  }
  
  return true;
};

// Request location permission and get current position
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch(error.code) {
          case 1:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case 2:
            errorMessage = 'Unable to determine your location.';
            break;
          case 3:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Watch location changes (for continuous tracking)
export const watchLocation = (onLocationUpdate, onError) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by your browser'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp)
      });
    },
    (error) => {
      let errorMessage = 'Unable to track your location';
      
      switch(error.code) {
        case 1:
          errorMessage = 'Location permission denied.';
          break;
        case 2:
          errorMessage = 'Unable to determine your location.';
          break;
        case 3:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      onError(new Error(errorMessage));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }
  );

  return watchId;
};

// Stop watching location
export const stopWatchingLocation = (watchId) => {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};
