import { useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import StatusButton from "../DeliveryStatus";

function OrdersTab({ orders, setSelectedOrder, fetchData }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await API.put(`/orders/${orderId}`, { status: newStatus });
      toast.success("Order status updated!");
      fetchData();
      setOpenDropdown(null);
    } catch (err) {
      toast.error("Failed to update status!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (orders.length === 0) {
    return(
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700">
          No orders found!
        </h2>

        <p className="text-gray-500 mt-2">
          It seems you haven't received any orders yet.
        </p>
      </div>
    ); 
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
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
              {`Customer: ${order.user?.name || "N/A"}`}
            </p>
            
            <p className="text-xs text-gray-500 truncate">
              {order.items?.[0]?.food?.name || "Unknown Item"}
              {order.items.length > 1 && ` | ${order.items.length - 1} more item${order.items.length > 2 ? "s" : ""}`}
            </p>
            
            <p className="font-bold text-gray-900 text-sm">₹{order.totalAmount}</p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 col-span-3 sm:col-span-1 sm:justify-center">
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === order._id ? null : order._id)}
                className="w-full px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1 cursor-pointer"
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
                      
                      {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((status) => (
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

            <button
              onClick={() => setSelectedOrder(order)}
              className="px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              View Details
              
              <FaEye className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrdersTab;
