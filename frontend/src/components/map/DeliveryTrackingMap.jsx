import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import MapView from './MapView';
import { useSocket } from '../../context/SocketContext';
import { calculateDistance, calculateETA, customerIcon, deliveryIcon } from '../../utils/mapUtils';
import API from '../../api/axios';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

function RoutingMachine({ deliveryLocation, customerLocation, onRouteFound }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !deliveryLocation || !customerLocation) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (e) {
        console.log('[RoutingMachine] Error removing control:', e);
      }
      routingControlRef.current = null;
    }

    // Remove any leftover routing containers
    const existingContainers = document.querySelectorAll('.leaflet-routing-container');
    existingContainers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });

    // Small delay to ensure map is ready
    setTimeout(() => {
      try {
        // Create routing control
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(deliveryLocation.lat, deliveryLocation.lng),
            L.latLng(customerLocation.lat, customerLocation.lng)
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: '#3B82F6', opacity: 0.8, weight: 5 }]
          },
          createMarker: function() { return null; },
          show: false,
        }).addTo(map);

        setTimeout(() => {
          const containers = document.querySelectorAll('.leaflet-routing-container');
          containers.forEach(container => {
            container.style.display = 'none';
          });
        }, 100);

        routingControl.on('routesfound', function(e) {
          const routes = e.routes;
          const summary = routes[0].summary;
          
          const distanceKm = summary.totalDistance / 1000;
          const timeMinutes = Math.round(summary.totalTime / 60);
          
          if (onRouteFound) {
            onRouteFound({
              distance: distanceKm,
              time: timeMinutes
            });
          }
        });

        routingControl.on('routingerror', function(e) {
          console.error('[RoutingMachine] Routing error:', e);
        });

        routingControlRef.current = routingControl;
      } catch (error) {
        console.error('[RoutingMachine] Routing error:', e);
      }
    }, 100);

    // Cleanup
    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.log('[RoutingMachine] Error during cleanup:', e);
        }
        routingControlRef.current = null;
      }
      
      const containers = document.querySelectorAll('.leaflet-routing-container');
      containers.forEach(container => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
    };
  }, [map, deliveryLocation?.lat, deliveryLocation?.lng, customerLocation?.lat, customerLocation?.lng, onRouteFound]);

  return null;
}

function DeliveryTrackingMap({ orderId, customerLocation, deliveryBoyLocation, deliveryBoyInfo, orderStatus, onStateChange, autoShareLocation = false, height = "320px" }) {
  const [currentDeliveryLocation, setCurrentDeliveryLocation] = useState(deliveryBoyLocation);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeTime, setRouteTime] = useState(null);
  const { socket } = useSocket();

  const handleRouteFound = (routeInfo) => {
    setRouteDistance(routeInfo.distance);
    setRouteTime(routeInfo.time);
  };

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        currentLocation: currentDeliveryLocation,
        isSharing: !!currentDeliveryLocation,
        distance: routeDistance !== null ? routeDistance : distance,
        eta: routeTime !== null ? `${routeTime} min` : eta
      });
    }
  }, [currentDeliveryLocation, distance, eta, routeDistance, routeTime, onStateChange]);

  // Calculate distance and ETA when delivery location changes
  useEffect(() => {
    if (currentDeliveryLocation && customerLocation) {
      const dist = calculateDistance(
        currentDeliveryLocation.lat,
        currentDeliveryLocation.lng,
        customerLocation.lat,
        customerLocation.lng
      );
      setDistance(dist);
      setEta(calculateETA(dist));
    }
  }, [currentDeliveryLocation, customerLocation]);

  // Socket.io listeners for real-time location updates
  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit('joinOrderRoom', orderId);
    
    const fetchOrderLocation = async () => {
      try {
        const response = await API.get(`/orders/${orderId}`);
        if (response.data.order?.deliveryLocation) {
          setCurrentDeliveryLocation({
            lat: response.data.order.deliveryLocation.lat,
            lng: response.data.order.deliveryLocation.lng
          });
        }
      } catch (error) {
        console.error('[DeliveryTrackingMap] Failed to fetch order location:', error);
      }
    };
    
    fetchOrderLocation();

    socket.on('connect', fetchOrderLocation);

    socket.on('deliveryLocationUpdated', (data) => {
      if (data.orderId === orderId && data.location) {
        setCurrentDeliveryLocation({
          lat: data.location.lat,
          lng: data.location.lng
        });
      }
    });

    return () => {
      socket.emit('leaveOrderRoom', orderId);
      socket.off('connect');
      socket.off('deliveryLocationUpdated');
    };
  }, [socket, orderId]);

  // Prepare markers
  const markers = [];
  
  if (customerLocation) {
    markers.push({
      id: 'customer',
      position: [customerLocation.lat, customerLocation.lng],
      icon: customerIcon,
      popup: 'Your Delivery Location'
    });
  }

  if (currentDeliveryLocation) {
    markers.push({
      id: 'delivery',
      position: [currentDeliveryLocation.lat, currentDeliveryLocation.lng],
      icon: deliveryIcon,
      popup: deliveryBoyInfo ? `${deliveryBoyInfo.name} - Delivery Partner` : 'Delivery Partner'
    });
  }

  // Calculate center point between customer and delivery boy
  const getCenter = () => {
    if (currentDeliveryLocation && customerLocation) {
      return [
        (currentDeliveryLocation.lat + customerLocation.lat) / 2,
        (currentDeliveryLocation.lng + customerLocation.lng) / 2
      ];
    }
    if (customerLocation) {
      return [customerLocation.lat, customerLocation.lng];
    }
    return [28.6139, 77.2090]; // Default center
  };

  // Calculate appropriate zoom level based on distance
  const getZoom = () => {
    if (!distance) return 13;
    if (distance < 1) return 15;
    if (distance < 5) return 13;
    if (distance < 10) return 12;
    return 11;
  };

  return (
    <MapView
      center={getCenter()}
      zoom={getZoom()}
      height={height}
      markers={markers}
    >
      <MapUpdater center={getCenter()} zoom={getZoom()} />
      
      {currentDeliveryLocation && customerLocation && (
        <RoutingMachine 
          deliveryLocation={currentDeliveryLocation}
          customerLocation={customerLocation}
          onRouteFound={handleRouteFound}
        />
      )}
    </MapView>
  );
}

export default DeliveryTrackingMap;