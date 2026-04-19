import { useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import { FaEye, FaCheckCircle } from "react-icons/fa";
import { StatusButton, formatDate, getStatusName } from "../../utils/orderUtils.jsx";

function DeliveryOrdersTab({ orders, setSelectedOrder, fetchData, currentUserId, activeTab, recentUpdateRef }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleAcceptOrder = async (orderId) => {
    try {
      recentUpdateRef.current = orderId;
      await API.put(`/orders/${orderId}`, { 
        deliveryBoy: currentUserId,
        status: "out_for_delivery"
      });
      toast.success("Order accepted!");
      fetchData();
    } catch (err) {
      recentUpdateRef.current = null;
      toast.error("Failed to accept order!");
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      recentUpdateRef.current = orderId;
      await API.put(`/orders/${orderId}`, { status: newStatus });
      const statusName = getStatusName(newStatus);
      fetchData();
      setOpenDropdown(null);
    } catch (err) {
      recentUpdateRef.current = null;
      toast.error("Failed to update status!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const availableOrders = orders.filter(o => 
    o.status === "preparing" && !o.deliveryBoy
  );
  
  const myOrders = orders.filter(o => 
    o.deliveryBoy?._id === currentUserId || o.deliveryBoy === currentUserId
  );

  const allOrders = [...availableOrders, ...myOrders];

  return (
    <div>
      
      {/* All Orders Tab */}
      {activeTab === "allorders" && (
        <div>
          {allOrders.length > 0 ? (
            <div className="space-y-4">
              {allOrders.map((order) => {
                const earnings = Math.max(order.totalAmount * 0.1, 50);
                const isMyOrder = order.deliveryBoy?._id === currentUserId || order.deliveryBoy === currentUserId;
                const isAvailable = order.status === "preparing" && !order.deliveryBoy;
                const isDelivered = order.status === "delivered";
                const isCancelled = order.status === "cancelled";
                
                return (
                  <div
                    key={order._id}
                    className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border rounded-2xl transition ${
                      isAvailable 
                        ? "border-2 border-green-200 bg-green-50 hover:bg-green-100" 
                        : isCancelled 
                        ? "border-2 border-red-200 bg-red-50 hover:bg-red-100" 
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    
                    <div className="relative w-20 h-20 shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200">
                        {order.items[0]?.food?.image ? (
                          <img
                            src={order.items[0].food.image}
                            alt={order.items[0].food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                            {order.items?.[0]?.food?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>

                      {order.items.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                          +{order.items.length - 1}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-center gap-1 min-w-0">
                      <StatusButton order={order} />
                      <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                        Order ID: {order._id.slice(-8).toUpperCase()}
                      </p>
                      <span className="text-xs font-semibold text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex flex-col justify-center gap-1 min-w-0 col-span-2 sm:col-span-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                        {order.address}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {order.items?.[0]?.food?.name || "Unknown Item"}
                        {order.items.length > 1 && ` | ${order.items.length - 1} more item${order.items.length > 2 ? "s" : ""}`}
                      </p>
                      <p className={`font-bold text-sm ${isAvailable ? 'text-green-700' : (isDelivered ? 'text-green-600' : 'text-orange-600')}`}>
                        {isAvailable ? 'Est. earning' : (isDelivered ? 'Earning' : 'Est. earning')}: ₹{Math.round(earnings)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 col-span-3 sm:col-span-1 sm:justify-center">
                      {isAvailable ? (
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Accept Order
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                      ) : isMyOrder && !isDelivered && !isCancelled ? (
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === order._id ? null : order._id)}
                            className="w-full px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1 cursor-pointer"
                            disabled={order.status === "cancelled"}
                          >
                            Update Status
                            <MdEdit className="w-4 h-4" />
                          </button>

                          {openDropdown === order._id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenDropdown(null)}
                              />

                              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <div className="py-2">
                                  <p className="px-4 py-2 text-xs font-semibold text-gray-500">Select New Status</p>
                                  
                                  {["out_for_delivery", "delivered"].map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => handleStatusUpdate(order._id, status)}
                                      disabled={updatingStatus || order.status === status}
                                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition cursor-pointer ${
                                        order.status === status ? "bg-gray-100 cursor-not-allowed opacity-50" : ""
                                      }`}
                                    >
                                      <StatusButton order={{ status }} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        View Details
                        <FaEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-gray-700">
                No orders yet!
              </h2>
              <p className="text-gray-500 mt-2">
                Orders will appear here.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Available Orders Tab */}
      {activeTab === "available" && (
        <div>
          {availableOrders.length > 0 ? (
            <div className="space-y-4">
              {availableOrders.map((order) => {
                const earnings = Math.max(order.totalAmount * 0.1, 50);
                return (
                  <div
                    key={order._id}
                    className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border-2 border-green-200 bg-green-50 rounded-2xl hover:bg-green-100 transition"
                  >
                    
                    <div className="relative w-20 h-20 shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200">
                        {order.items[0]?.food?.image ? (
                          <img
                            src={order.items[0].food.image}
                            alt={order.items[0].food.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                            {order.items?.[0]?.food?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>

                      {order.items.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                          +{order.items.length - 1}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start justify-center gap-1 min-w-0">
                      <StatusButton order={order} />
                      <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                        Order ID: {order._id.slice(-8).toUpperCase()}
                      </p>
                      <span className="text-xs font-semibold text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex flex-col justify-center gap-1 min-w-0 col-span-2 sm:col-span-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                        {order.address}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {order.items?.[0]?.food?.name || "Unknown Item"}
                        {order.items.length > 1 && ` | ${order.items.length - 1} more item${order.items.length > 2 ? "s" : ""}`}
                      </p>
                      <p className="font-bold text-green-700 text-sm">Est. earning: ₹{Math.round(earnings)}</p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 col-span-3 sm:col-span-1 sm:justify-center">
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Accept Order
                        <FaCheckCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        View Details
                        <FaEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-gray-700">
                No available orders!
              </h2>
              <p className="text-gray-500 mt-2">
                Check back later for new delivery orders.
              </p>
            </div>
          )}
        </div>
      )}

      {/* My Deliveries Tab */}
      {activeTab === "mydeliveries" && (
        <div>
          {myOrders.length > 0 ? (
            <div className="space-y-4">
              {myOrders.map((order) => {
                const earnings = Math.max(order.totalAmount * 0.1, 50);
                const isDelivered = order.status === "delivered";
                const isCancelled = order.status === "cancelled";
                return (
                  <div
                    key={order._id}
                    className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition"
                  >
                  
                  <div className="relative w-20 h-20 shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200">
                      {order.items[0]?.food?.image ? (
                        <img
                          src={order.items[0].food.image}
                          alt={order.items[0].food.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                          {order.items?.[0]?.food?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>

                    {order.items.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                        +{order.items.length - 1}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start justify-center gap-1 min-w-0">
                    <StatusButton order={order} />
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                      Order ID: {order._id.slice(-8).toUpperCase()}
                    </p>
                    <span className="text-xs font-semibold text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex flex-col justify-center gap-1 min-w-0 col-span-2 sm:col-span-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                      {order.address}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.items?.[0]?.food?.name || "Unknown Item"}
                      {order.items.length > 1 && ` | ${order.items.length - 1} more item${order.items.length > 2 ? "s" : ""}`}
                    </p>
                    <p className={`font-bold text-sm ${isDelivered ? 'text-green-600' : 'text-orange-600'}`}>
                      {isDelivered ? 'Earning' : 'Est. earning'}: ₹{Math.round(earnings)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 col-span-3 sm:col-span-1 sm:justify-center">
                    {!isDelivered && !isCancelled && (
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === order._id ? null : order._id)}
                          className="w-full px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1 cursor-pointer"
                          disabled={order.status === "cancelled"}
                        >
                          Update Status
                          <MdEdit className="w-4 h-4" />
                        </button>

                        {openDropdown === order._id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenDropdown(null)}
                            />

                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <div className="py-2">
                                <p className="px-4 py-2 text-xs font-semibold text-gray-500">Select New Status</p>
                                
                                {["out_for_delivery", "delivered"].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(order._id, status)}
                                    disabled={updatingStatus || order.status === status}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center transition cursor-pointer ${
                                      order.status === status ? "bg-gray-100 cursor-not-allowed opacity-50" : ""
                                    }`}
                                  >
                                    <StatusButton order={{ status }} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      View Details
                      <FaEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-gray-700">
                No deliveries yet!
              </h2>
              <p className="text-gray-500 mt-2">
                Accept orders from the Available Orders tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delivered Tab */}
      {activeTab === "delivered" && (
        <div>
          {myOrders.filter(o => o.status === "delivered").length > 0 ? (
            <div className="space-y-4">
              {myOrders.filter(o => o.status === "delivered").map((order) => {
                const earnings = Math.max(order.totalAmount * 0.1, 50);
                
                return (
                  <div
                    key={order._id}
                    className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border border-gray-300 rounded-2xl hover:bg-gray-50 transition"
                  >
                  
                  <div className="relative w-20 h-20 shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200">
                      {order.items[0]?.food?.image ? (
                        <img
                          src={order.items[0].food.image}
                          alt={order.items[0].food.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                          {order.items?.[0]?.food?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>

                    {order.items.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                        +{order.items.length - 1}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start justify-center gap-1 min-w-0">
                    <StatusButton order={order} />
                    <p className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                      Order ID: {order._id.slice(-8).toUpperCase()}
                    </p>
                    <span className="text-xs font-semibold text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>

                  <div className="flex flex-col justify-center gap-1 min-w-0 col-span-2 sm:col-span-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                      {order.address}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.items?.[0]?.food?.name || "Unknown Item"}
                      {order.items.length > 1 && ` | ${order.items.length - 1} more item${order.items.length > 2 ? "s" : ""}`}
                    </p>
                    <p className="font-bold text-sm text-green-600">
                      Earning: ₹{Math.round(earnings)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 col-span-3 sm:col-span-1 sm:justify-center">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      View Details
                      <FaEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-gray-700">
                No delivered orders yet!
              </h2>
              <p className="text-gray-500 mt-2">
                Delivered orders will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DeliveryOrdersTab;