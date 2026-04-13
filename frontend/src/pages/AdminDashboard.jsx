import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { MdDashboard, MdRestaurantMenu, MdShoppingCart } from "react-icons/md";
import { BsCashStack } from "react-icons/bs";
import PageHeader from "../components/PageHeader";
import OrdersTab from "../components/admin/OrdersTab";
import FoodsTab from "../components/admin/FoodsTab";
import OrderModal from "../components/admin/OrderModal";
import FoodModal from "../components/admin/FoodModal";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "orders") {
        const { data } = await API.get("/orders/");
        setOrders(data);
      } else if (activeTab === "foods") {
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
        console.error("Failed to fetch foods count");
      }
    };
    fetchFoodsCount();
  }, []);

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    pendingOrders: orders.filter(o => o.status === "pending").length,
    totalFoods: foods.length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-16">
        
        <PageHeader icon={MdDashboard} badge="ADMIN DASHBOARD" title="Manage your restaurant workflow" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
              </div>
              
              <BsCashStack className="text-4xl text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              
              <MdShoppingCart className="text-4xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Orders</p>
                
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              
              <MdShoppingCart className="text-4xl text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(15,23,50,0.10)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Menu Items</p>
                
                <p className="text-2xl font-bold text-gray-900">{stats.totalFoods}</p>
              </div>
              
              <MdRestaurantMenu className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="flex gap-3 p-2 mb-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "orders"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <MdShoppingCart />
              
              Orders
            </button>

            <button
              onClick={() => setActiveTab("foods")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === "foods"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <MdRestaurantMenu />
              
              Menu
            </button>
          </div>

          {/* Tabs*/}
          <div>
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : activeTab === "orders" ? (
              <OrdersTab 
                orders={orders} 
                setSelectedOrder={setSelectedOrder} 
                fetchData={fetchData} 
              />
            ) : (
              <FoodsTab 
                foods={foods} 
                setShowFoodModal={setShowFoodModal} 
                setFoodForm={setFoodForm} 
                fetchData={fetchData} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderModal 
          order={selectedOrder} 
          setSelectedOrder={setSelectedOrder} 
          fetchData={fetchData} 
        />
      )}

      {showFoodModal && (
        <FoodModal 
          foodForm={foodForm} 
          setFoodForm={setFoodForm} 
          setShowFoodModal={setShowFoodModal} 
          fetchData={fetchData} 
        />
      )}
    </div>
  );
}

export default AdminDashboard;