import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import { StatusButton, formatDate, formatPaymentMethod } from "../utils/orderUtils.jsx";
import toast from "react-hot-toast";
import { MdClose, MdDeliveryDining, MdAccessTimeFilled, MdCancel } from "react-icons/md";
import { FaChevronRight, FaEye } from "react-icons/fa6";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { HiSquares2X2 } from "react-icons/hi2";
import PageHeader from "../components/PageHeader";

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const tabsRef = useRef(null);

  const handleFilterChange = (newFilter, event) => {
    setFilter(newFilter);
    // Scroll the clicked button into view
    if (event.currentTarget && tabsRef.current) {
      event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/my");

      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch(err) {
      toast.error("Failed to fetch orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await API.put(`/orders/${orderId}`, { status: "cancelled" });
      toast.success("Order cancelled successfully!");
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      toast.error("Failed to cancel order!");
    }
  };

  const inProgressStatuses = ["pending", "confirmed", "preparing", "out_for_delivery"];

  const filteredOrders = orders.filter((order) => {
    if(filter === "All Orders") return true;
    if(filter === "In Progress") return inProgressStatuses.includes(order.status);
    if(filter === "Delivered") return order.status === "delivered";
    if(filter === "Cancelled") return order.status === "cancelled";
    return true;
  });

  const formatPaymentMethod = (method) => {
    const methods = {
      cod: "Cash On Delivery",
      online: "Online Payment"
    };
    return methods[method.toLowerCase()] || method.toUpperCase();
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 pt-5 pb-16 bg-white">
      
      <PageHeader icon={MdDeliveryDining} badge="YOUR ORDERS" title="Track your food delivery status" />

      <div ref={tabsRef} className="flex overflow-x-auto gap-3 mb-6 scrollbar-hide">
        <button
          onClick={(e) => handleFilterChange("All Orders", e)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
            filter === "All Orders"
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <HiSquares2X2 className="w-4 h-4" />
          <span>All Orders</span>
        </button>

        <button
          onClick={(e) => handleFilterChange("In Progress", e)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
            filter === "In Progress"
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <MdAccessTimeFilled className="w-4 h-4" />
          <span>In Progress</span>
        </button>

        <button
          onClick={(e) => handleFilterChange("Delivered", e)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
            filter === "Delivered"
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <FaCheckCircle />
          <span>Delivered</span>
        </button>

        <button
          onClick={(e) => handleFilterChange("Cancelled", e)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
            filter === "Cancelled"
              ? "bg-orange-500 text-white hover:bg-orange-600"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <FaTimesCircle />
          <span>Cancelled</span>
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-700">
                No orders found!
            </h2>

            <p className="text-gray-500 mt-2">
                You have no {filter.toLowerCase()} orders.
            </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className={`grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_1fr_auto] gap-4 p-4 border rounded-2xl transition cursor-pointer ${
                order.status === "cancelled"
                  ? "border-2 border-red-200 bg-red-50 hover:bg-red-100"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >

              <div className="relative w-20 h-20 shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200">
                  {order.items[0]?.food?.image? (
                    <img
                      src={order.items[0]?.food?.image}
                      alt={order.items[0]?.food?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-bold">
                      {order.items[0]?.food?.name?.charAt(0)}
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
                <span className="text-xs font-semibold text-gray-500">
                  {formatDate(order.createdAt)}
                </span>
              </div>

              <div className="flex flex-col justify-center gap-1 min-w-0 col-span-2 sm:col-span-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                  {order.items[0]?.food?.name}
                  {order.items.length > 1 && ` | ${order.items.length - 1} more item${order.items.length > 2 ? "s" : ""}`}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {formatPaymentMethod(order.paymentMethod)}
                </p>
                <p className="font-bold text-gray-900 text-sm">₹{order.totalAmount}</p>
              </div>

              <div className="flex items-center justify-center shrink-0 col-span-3 sm:col-span-1">
                <button className="sm:hidden w-full px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1">
                  View Details
                  <FaEye className="w-4 h-4" />
                </button>
                
                <div className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
                  <FaChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-400">Order ID: {selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <MdClose className="text-2xl"/>
                  </button>
              </div>

              <div className="border-t opacity-30 mb-4"/>

              <div className="flex items-center gap-3 mb-4">
                <StatusButton order={selectedOrder} />
                <span className="text-sm text-gray-400">{formatDate(selectedOrder.createdAt)}</span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Address: </span>
                  {selectedOrder.address}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Payment: </span>
                  {formatPaymentMethod(selectedOrder.paymentMethod)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Total: </span>
                  <span className="text-orange-500 font-bold">₹{selectedOrder.totalAmount}</span>
                </p>
              </div>

              <div className="border-t opacity-10"/>
            </div>

            <div className="px-6 pb-6 overflow-y-auto">
              <h3 className="font-bold text-gray-900 mb-3">Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
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

              <div className="flex justify-end mt-6">
                {["pending", "confirmed", "preparing"].includes(selectedOrder.status) && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2 cursor-pointer"
                  >
                    <MdCancel className="w-5 h-5" />
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
  );
}

export default Order; 