import { useState } from "react";
import { MdClose, MdAccessTime, MdNavigation } from "react-icons/md";
import DeliveryTrackingMap from "./map/DeliveryTrackingMap";
import { formatDistance } from "../utils/mapUtils";

function LiveTrackingModal({ order, onClose }) {
  const hasCoordinates = order.deliveryAddress?.coordinates?.lat && order.deliveryAddress?.coordinates?.lng;
  const [mapState, setMapState] = useState({
    currentLocation: null,
    isSharing: false,
    distance: null,
    eta: null
  });

  if (!hasCoordinates) {
    return (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Live Tracking</h2>
            <button
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              onClick={onClose}
            >
              <MdClose className="text-2xl" />
            </button>
          </div>
          <p className="text-gray-600 text-center py-8">
            Location information not available for this order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Track Your Order</h2>
              <p className="text-sm text-gray-400">Order ID: {order._id.slice(-8).toUpperCase()}</p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              onClick={onClose}
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <div className="border-t opacity-30 mb-4" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-96 shrink-0">
              <DeliveryTrackingMap
                orderId={order._id}
                customerLocation={{
                  lat: order.deliveryAddress.coordinates.lat,
                  lng: order.deliveryAddress.coordinates.lng
                }}
                deliveryBoyLocation={order.deliveryLocation ? {
                  lat: order.deliveryLocation.lat,
                  lng: order.deliveryLocation.lng
                } : null}
                deliveryBoyInfo={order.deliveryBoy}
                orderStatus={order.status}
                onStateChange={setMapState}
                height="300px"
              />
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {mapState.isSharing ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-800">
                      Your delivery partner is on the way!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-yellow-800">
                      Waiting for delivery partner to start tracking...
                    </span>
                  </div>
                </div>
              )}

              {mapState.currentLocation && mapState.distance !== null ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <MdNavigation className="text-xl text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Distance</p>
                      <p className="text-sm font-bold text-gray-900">{formatDistance(mapState.distance)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <MdAccessTime className="text-xl text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">ETA</p>
                      <p className="text-sm font-bold text-gray-900">{mapState.eta}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <MdNavigation className="text-xl text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="text-sm font-bold text-gray-400">--</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <MdAccessTime className="text-xl text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="text-sm font-bold text-gray-400">--</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Address:</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {order.deliveryAddress?.mapAddress || "N/A"}
                </p>
                {order.deliveryAddress?.houseNo && (
                  <p className="text-xs text-gray-600 mt-1">
                    House No: {order.deliveryAddress.houseNo}
                  </p>
                )}
                {order.deliveryAddress?.landmark && (
                  <p className="text-xs text-gray-600">
                    Landmark: {order.deliveryAddress.landmark}
                  </p>
                )}
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Partner:</p>
                {order.deliveryBoy ? (
                  <p className="text-xs text-gray-600">
                    {order.deliveryBoy.name}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">--</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveTrackingModal;
