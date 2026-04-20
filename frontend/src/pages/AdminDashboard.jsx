import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import { MdDashboard, MdShoppingCart, MdRestaurantMenu } from "react-icons/md";
import { BsCashStack } from "react-icons/bs";
import PageHeader from "../components/PageHeader";
import OrdersTab from "../components/admin/OrdersTab";
import FoodsTab from "../components/admin/FoodsTab";
import OrderModal from "../components/admin/OrderModal";
import FoodModal from "../components/admin/FoodModal";
import { FaCheckCircle } from "react-icons/fa";
import { HiSquares2X2 } from "react-icons/hi2";
import { GoPlusCircle } from "react-icons/go";
import { getStatusName } from "../utils/orderUtils";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("allorders");
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foodForm, setFoodForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const tabsRef = useRef(null);
  const tabsSectionRef = useRef(null);
  const { socket } = useSocket();
  const recentUpdateRef = useRef(null);

  const handleTabChange = (newTab, event) => {
    setActiveTab(newTab);
    
    // If clicked from tab button, scroll that button into view
    if (event && event.currentTarget && tabsRef.current) {
      event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      // If clicked from stat card, scroll to tabs section and center the corresponding button
      if (tabsSectionRef.current) {
        setTimeout(() => {
          tabsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      
      // Find and scroll the corresponding tab button to center
      if (tabsRef.current) {
        setTimeout(() => {
          const buttons = tabsRef.current.querySelectorAll('button');
          const tabMap = {
            'allorders': 0,
            'available': 1,
            'accepted': 2,
            'delivered': 3,
            'menu': 4
          };
          const buttonIndex = tabMap[newTab];
          if (buttons[buttonIndex]) {
            buttons[buttonIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }, 300);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Socket.io listeners - For real time updates
  useEffect(() => {
    if (!socket) return;

    socket.on("newOrder", (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      toast.success("New order received!");
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      
      if (recentUpdateRef.current === updatedOrder._id) {
        recentUpdateRef.current = null;
        return;
      }
      
      const orderId = updatedOrder._id.slice(-8).toUpperCase();
      const statusName = getStatusName(updatedOrder.status);
      toast.success(`Order ${orderId} updated to ${statusName}`);
    });

    socket.on("orderCancelledByUser", (cancelledOrder) => {
      toast.error(`Order ${cancelledOrder._id.slice(-8).toUpperCase()} cancelled by ${cancelledOrder.user?.name || 'customer'}!`, {
        duration: 4000,
      });
    });

    socket.on("orderDeleted", (orderId) => {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
      toast.success(`Order ${orderId.slice(-8).toUpperCase()} has been deleted`);
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
      socket.off("orderCancelledByUser");
      socket.off("orderDeleted");
    };
  }, [socket, selectedOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "allorders" || activeTab === "available" || activeTab === "accepted" || activeTab === "delivered") {
        const { data } = await API.get("/orders/");
        
        const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } else if (activeTab === "menu") {
        const { data } = await API.get("/foods");
        setFoods(data);
      }
    } catch (err) {
      toast.error("Failed to fetch data!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFoodsCount = async () => {
      try {
        const { data } = await API.get("/foods");
        setFoods(data);
      } catch (err) {
        // Failed to fetch foods count
      }
    };
    fetchFoodsCount();
  }, []);

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders
      .filter(o => o.status === "delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0),
    pendingOrders: orders.filter(o => o.status === "pending").length,
    acceptedOrders: orders.filter(o => o.status !== "pending" && o.status !== "cancelled").length,
    totalFoods: foods.length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-16">
        
        <PageHeader 
          icon={MdDashboard}
          badge="ADMIN DASHBOARD"
          title="Manage your restaurant workflow"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <button
            onClick={() => handleTabChange("allorders")}
            className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)] hover:shadow-[0_0_30px_rgba(15,23,50,0.15)] transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <MdShoppingCart className="text-4xl text-orange-500" />
            </div>
          </button>

          <button
            onClick={() => handleTabChange("allorders")}
            className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)] hover:shadow-[0_0_30px_rgba(15,23,50,0.15)] transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <MdShoppingCart className="text-4xl text-blue-500" />
            </div>
          </button>

          <button
            onClick={() => handleTabChange("menu")}
            className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)] hover:shadow-[0_0_30px_rgba(15,23,50,0.15)] transition cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Menu Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFoods}</p>
              </div>
              <GoPlusCircle className="text-4xl text-gray-800" />
            </div>
          </button>
        </div>

        {/* Tabs */}
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
              onClick={(e) => handleTabChange("accepted", e)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "accepted"
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
              <FaCheckCircle />
              <span>Delivered Orders</span>
            </button>

            <button
              onClick={(e) => handleTabChange("menu", e)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "menu"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <MdRestaurantMenu />
              Menu
            </button>
          </div>

          <div>
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : activeTab === "allorders" || activeTab === "available" || activeTab === "accepted" || activeTab === "delivered" ? (
              <OrdersTab orders={orders} setSelectedOrder={setSelectedOrder} fetchData={fetchData} activeTab={activeTab} recentUpdateRef={recentUpdateRef} />
            ) : (
              <FoodsTab foods={foods} setShowFoodModal={setShowFoodModal} setFoodForm={setFoodForm} fetchData={fetchData} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderModal order={selectedOrder} setSelectedOrder={setSelectedOrder} fetchData={fetchData} />
      )}

      {showFoodModal && (
        <FoodModal foodForm={foodForm} setFoodForm={setFoodForm} setShowFoodModal={setShowFoodModal} fetchData={fetchData} />
      )}
    </div>
  );
}

export default AdminDashboard;
