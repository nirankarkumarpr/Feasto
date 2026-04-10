import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { MdDashboard, MdRestaurantMenu, MdShoppingCart, MdClose, MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { BsCashStack } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import StatusButton from "../components/DeliveryStatus";

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
        
        <div className="mb-10 flex flex-col items-center justify-center">
            <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                <MdDashboard className="inline-block mr-1 w-5 h-5" />
                ADMIN DASHBOARD
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 text-center">
                Manage your restaurant workflow 
            </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
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
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
              </div>
              <BsCashStack className="text-4xl text-green-500" />
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

          <div>
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : activeTab === "orders" ? (
              <OrdersTab orders={orders} setSelectedOrder={setSelectedOrder} fetchData={fetchData} />
            ) : (
              <FoodsTab foods={foods} setShowFoodModal={setShowFoodModal} setFoodForm={setFoodForm} fetchData={fetchData} />
            )}
          </div>

        </div>
      </div>

      {selectedOrder && (
        <OrderModal order={selectedOrder} setSelectedOrder={setSelectedOrder} fetchData={fetchData} />
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
                  >
                  </div>

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


function FoodsTab({ foods, setShowFoodModal, setFoodForm, fetchData }) {
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await API.delete(`/foods/${id}`);
      toast.success("Food item deleted!");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete food item!");
    }
  };

  const handleEdit = (food) => {
    setFoodForm({
      id: food._id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
    });
    setShowFoodModal(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        <button
          onClick={() => {
            setFoodForm({ name: "", description: "", price: "", category: "", image: "" });
            setShowFoodModal(true);
          }}
          className="group overflow-hidden rounded-4xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50 cursor-pointer"
        >
          <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[400px]">
            <CiCirclePlus className="w-24 h-24 text-slate-600 group-hover:text-orange-600 transition" />

            <p className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition">
              Add New Item
            </p>
          </div>
        </button>

        {foods.map((food) => (
            <article 
              key={food._id} 
              className="group overflow-hidden rounded-4xl border border-slate-100 bg-white p-5 shadow-[0_0_100px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(249,115,22,0.15)]"
            >
              <div className="relative h-56 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#fff1e6_0%,#fed7aa_100%)]">
                {food.image ? (
                  <img 
                    src={food.image} 
                    alt={food.name} 
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl font-bold uppercase text-orange-300">
                    {food.name.charAt(0)}
                  </div>
                )}

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                  {food.category}
                </span>

                <span className="absolute right-4 top-4 shadow-md rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                  ₹{food.price}
                </span>
              </div>

              <div className="mt-5 flex items-left flex-col justify-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{food.name}</h2>

                <p className="text-sm text-slate-500 line-clamp-2">
                  {food.description}
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleEdit(food)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2.5 rounded-2xl text-sm font-semibold hover:bg-blue-600 transition cursor-pointer"
                >
                  <MdEdit className="w-4 h-4" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(food._id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2.5 rounded-2xl text-sm font-semibold hover:bg-red-600 transition cursor-pointer"
                >
                  <MdDelete className="w-4 h-4" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
        
    </div>
  );
}


function OrderModal({ order, setSelectedOrder, fetchData }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await API.delete(`/orders/${order._id}`);
      toast.success("Order deleted successfully!");
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
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="p-6">
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

          <div className="flex items-center gap-3 mb-4">
            <StatusButton order={order} />
            <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
          </div>

          <div className="space-y-2 mb-4 text-sm">

            <p className="text-gray-700">
              <span className="font-semibold">Customer: </span>{order.user?.name || "N/A"}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Email: </span>{order.user?.email || "N/A"}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Address: </span>{order.address}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Payment: </span>{order.paymentMethod.toUpperCase()}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Total: </span>
              <span className="text-orange-500 font-bold">₹{order.totalAmount}</span>
            </p>

          </div>

          <div className="border-t opacity-10" />
        </div>

        <div className="px-6 pb-6 overflow-y-auto">

          <h3 className="font-bold text-gray-900 mb-3">Items</h3>

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


function FoodModal({ foodForm, setFoodForm, setShowFoodModal, fetchData }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (foodForm.id) {
        await API.put(`/foods/${foodForm.id}`, {
          name: foodForm.name,
          description: foodForm.description,
          price: Number(foodForm.price),
          category: foodForm.category,
          image: foodForm.image,
        });

        toast.success("Food item updated successfully!");
      } else {
        await API.post("/foods", {
          name: foodForm.name,
          description: foodForm.description,
          price: Number(foodForm.price),
          category: foodForm.category,
          image: foodForm.image,
        });
        
        toast.success("Food item added successfully!");
      }

      fetchData();
      setShowFoodModal(false);
    } catch (err) {
      toast.error("Failed to save food item!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={() => setShowFoodModal(false)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {foodForm.id ? "Edit Food Item" : "Add New Food Item"}
          </h2>

          <button
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
            onClick={() => setShowFoodModal(false)}
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={foodForm.description}
              onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
            <input
              type="number"
              value={foodForm.price}
              onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={foodForm.category}
              onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
              placeholder="e.g., Pizza, Burger, Dessert"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={foodForm.image}
              onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? "Saving..." : foodForm.id ? "Update Item" : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
