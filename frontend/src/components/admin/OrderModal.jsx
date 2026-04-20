import { useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { MdClose, MdDelete, MdAccessTime, MdNavigation } from "react-icons/md";
import { StatusButton, formatDate, formatPaymentMethod } from "../../utils/orderUtils.jsx";
import DeliveryTrackingMap from "../map/DeliveryTrackingMap";
import { formatDistance } from "../../utils/mapUtils";

function OrderModal({ order, setSelectedOrder, fetchData }) {
  const hasCoordinates = order.deliveryAddress?.coordinates?.lat && order.deliveryAddress?.coordinates?.lng;
  const [mapState, setMapState] = useState({
    currentLocation: null,
    isSharing: false,
    distance: null,
    eta: null
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await API.delete(`/orders/${order._id}`);
      fetchData();
      setSelectedOrder(null);
    } catch (err) {
      toast.error("Failed to delete order!");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={() => setSelectedOrder(null)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-400">Order ID: {order._id.slice(-8).toUpperCase()}</p>
            </div>

            <button
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              onClick={() => setSelectedOrder(null)}
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <div className="border-t opacity-30 mb-4" />

          <div className="flex items-center gap-3">
            <StatusButton order={order} />
            <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
          </div>

        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-2 mb-4 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Customer Name: </span>{order.customerName || order.user?.name || "N/A"}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Mobile: </span>{order.mobile || "N/A"}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Payment: </span>{formatPaymentMethod(order.paymentMethod)}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Total Amount: </span>
              <span className="text-orange-500 font-bold">₹{order.totalAmount}</span>
            </p>
          </div>

          <div className="border-t opacity-10 mb-2" />
          
          {hasCoordinates && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 mb-3">
                {order.status === 'delivered' ? 'Delivery Completed' : 'Navigation & Live Tracking'}
              </h3>
              
              {order.status === 'delivered' ? (

                // Delivered state - show success message
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-800">Order Delivered Successfully!</p>
                        <p className="text-sm text-green-600">Delivered on time</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Address:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {order.deliveryAddress?.mapAddress || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      House No: {order.deliveryAddress?.houseNo || "--"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Landmark: {order.deliveryAddress?.landmark || "--"}
                    </p>
                  </div>

                  {order.deliveryBoy ? (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Partner:</p>
                      <p className="text-xs text-gray-600">
                        {order.deliveryBoy.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.deliveryBoy.email || "--"}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Partner:</p>
                      <p className="text-xs text-gray-400">--</p>
                      <p className="text-xs text-gray-400">--</p>
                    </div>
                  )}
                </div>
              ) : (
                
                // Active delivery state - show map and tracking
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
                      autoShareLocation={false}
                      height="332px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    {mapState.isSharing ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-green-800">
                            Delivery partner is on the way to customer!
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-yellow-800">
                            Waiting for delivery partner to share location...
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
                      <p className="text-xs text-gray-600 mt-1">
                        House No: {order.deliveryAddress?.houseNo || "--"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Landmark: {order.deliveryAddress?.landmark || "--"}
                      </p>
                    </div>

                    {order.deliveryBoy ? (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Partner:</p>
                        <p className="text-xs text-gray-600">
                          {order.deliveryBoy.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.deliveryBoy.email || "--"}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Partner:</p>
                        <p className="text-xs text-gray-400">--</p>
                        <p className="text-xs text-gray-400">--</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    {item.food?.image ? (
                      <img
                        src={item.food.image}
                        alt={item.food.name}
                        className="w-full h-full object-cover scale-125"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                        {item.food?.name?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{item.food?.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} x ₹{item.price}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{item.quantity * item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleDelete()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2 cursor-pointer"
            >
              <MdDelete className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderModal;
