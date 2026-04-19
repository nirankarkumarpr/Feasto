import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { MdDeliveryDining, MdShoppingCart, MdCheckCircle } from "react-icons/md";
import { BsCashStack } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import { HiSquares2X2 } from "react-icons/hi2";
import PageHeader from "../components/PageHeader";
import DeliveryOrdersTab from "../components/delivery/DeliveryOrdersTab";
import DeliveryOrderModal from "../components/delivery/DeliveryOrderModal";
import { getStatusName } from "../utils/orderUtils";

function DeliveryDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState("allorders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const tabsRef = useRef(null);
  const tabsSectionRef = useRef(null);
  const recentUpdateRef = useRef(null);

  const handleTabChange = (newTab, event) => {
    setActiveTab(newTab);
    
    // Scroll to tabs section on mobile
    if (tabsSectionRef.current) {
      setTimeout(() => {
        tabsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    
    // If clicked from tab button, scroll that button into view
    if (event && event.currentTarget && tabsRef.current) {
      setTimeout(() => {
        event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }, 200);
    } else if (tabsRef.current) {
      // If clicked from stat card, find and scroll the corresponding tab button
      setTimeout(() => {
        const buttons = tabsRef.current.querySelectorAll('button');
        const tabMap = {
          'allorders': 0,
          'available': 1,
          'mydeliveries': 2,
          'delivered': 3
        };
        const buttonIndex = tabMap[newTab];
        if (buttons[buttonIndex]) {
          buttons[buttonIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 200);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Socket.io listeners - For real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on("orderUpdated", (updatedOrder) => {
      
      setOrders((prevOrders) => {
        const orderExists = prevOrders.some(o => o._id === updatedOrder._id);
        
        if (orderExists) {
          if (recentUpdateRef.current !== updatedOrder._id) {
            const orderId = updatedOrder._id.slice(-8).toUpperCase();
            const statusName = getStatusName(updatedOrder.status);
            toast.success(`Order ${orderId} updated to ${statusName}`);
          } else {
            recentUpdateRef.current = null;
          }
          
          return prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
        } else {
          if (updatedOrder.status === "preparing" && !updatedOrder.deliveryBoy) {
            if (recentUpdateRef.current !== updatedOrder._id) {
              toast.success("New order available for delivery!");
            } else {
              recentUpdateRef.current = null;
            }
            return [updatedOrder, ...prevOrders];
          }
          return prevOrders;
        }
      });
    });

    socket.on("orderDeleted", (orderId) => {
      console.log("Order deleted:", orderId);
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
      toast.error(`Order ${orderId.slice(-8).toUpperCase()} has been removed`);
    });

    return () => {
      socket.off("orderUpdated");
      socket.off("orderDeleted");
    };
  }, [socket, selectedOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/orders/delivery");
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (err) {
      toast.error("Failed to fetch orders!");
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for delivery boy
  const myOrders = orders.filter(o => o.deliveryBoy?._id === user?._id || o.deliveryBoy === user?._id);
  const deliveredOrders = myOrders.filter(o => o.status === "delivered");
  const activeDeliveries = myOrders.filter(o => o.status === "out_for_delivery");
  const availableOrders = orders.filter(o => o.status === "preparing" && !o.deliveryBoy);

  const totalEarnings = deliveredOrders.reduce((sum, order) => {
    const commission = Math.max(order.totalAmount * 0.1, 50);
    return sum + commission;
  }, 0);

  const stats = {
    totalEarnings: Math.round(totalEarnings),
    availableOrders: availableOrders.length,
    activeDeliveries: activeDeliveries.length,
    deliveredOrders: deliveredOrders.length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-16">
        
        <PageHeader icon={MdDeliveryDining} badge="DELIVERY DASHBOARD" title="Manage your deliveries" subtitle="Accept orders and track your earnings" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <button
            onClick={() => handleTabChange("mydeliveries")}
            className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)] hover:shadow-[0_0_30px_rgba(15,23,50,0.15)] transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings}</p>
              </div>
              <BsCashStack className="text-4xl text-green-500" />
            </div>
          </button>

          <button
            onClick={() => handleTabChange("available")}
            className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)] hover:shadow-[0_0_30px_rgba(15,23,50,0.15)] transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Available Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableOrders}</p>
              </div>
              <MdShoppingCart className="text-4xl text-orange-500" />
            </div>
          </button>

          <button
            onClick={() => handleTabChange("mydeliveries")}
            className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)] hover:shadow-[0_0_30px_rgba(15,23,50,0.15)] transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDeliveries}</p>
              </div>
              <MdDeliveryDining className="text-4xl text-blue-500" />
            </div>
          </button>

          <button
            onClick={() => handleTabChange("delivered")}
            className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)] hover:shadow-[0_0_30px_rgba(15,23,50,0.15)] transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
              </div>
              <MdCheckCircle className="text-4xl text-green-500" />
            </div>
          </button>
        </div>

        <div ref={tabsSectionRef} className="bg-white">
          
          <div ref={tabsRef} className="flex overflow-x-auto gap-3 p-2 mb-6 scrollbar-hide">
            <button
              onClick={(e) => handleTabChange("allorders", e)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "allorders"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <HiSquares2X2 />
              <span>All Orders</span>
            </button>

            <button
              onClick={(e) => handleTabChange("available", e)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "available"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <MdShoppingCart />
              <span>Available Orders</span>
            </button>

            <button
              onClick={(e) => handleTabChange("mydeliveries", e)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "mydeliveries"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <FaCheckCircle />
              <span>Accepted Orders</span>
            </button>

            <button
              onClick={(e) => handleTabChange("delivered", e)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "delivered"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <MdShoppingCart />
              <span>Delivered Orders</span>
            </button>
          </div>

          <div>
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <DeliveryOrdersTab orders={orders} setSelectedOrder={setSelectedOrder} fetchData={fetchOrders} currentUserId={user?._id} activeTab={activeTab} recentUpdateRef={recentUpdateRef} />
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <DeliveryOrderModal order={selectedOrder} setSelectedOrder={setSelectedOrder} />
      )}
    </div>
  );
}

export default DeliveryDashboard;
