import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { customerIcon } from '../../utils/mapUtils';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});


function MapView({ center = [28.6139, 77.2090], zoom = 13, height = "400px", markers = [], onMapClick, children }) {
  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        {onMapClick && <MapClickHandler onClick={onMapClick} />}
        
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={marker.icon || customerIcon}>
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
        
        {children}
      </MapContainer>
    </div>
  );
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default MapView;