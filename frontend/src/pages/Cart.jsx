import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { MdDelete, MdShoppingCart } from "react-icons/md";
import { HiPlusCircle, HiMinusCircle } from "react-icons/hi2";
import { FaLocationDot } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { BsCashStack } from "react-icons/bs";
import PageHeader from "../components/PageHeader";
import LocationPicker from "../components/map/LocationPicker";

function Cart() {
    const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, totalAmount, clearCart } = useCart();
    const { user } = useAuth();
    const [address, setAddress] = useState("");
    const [houseNo, setHouseNo] = useState("");
    const [landmark, setLandmark] = useState("");
    const [customerName, setCustomerName] = useState(user?.name || "");
    const [mobile, setMobile] = useState("");
    const [locationData, setLocationData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const deliveryCharge = 40;
    const grandTotal = totalAmount + deliveryCharge;
    
    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            const location = JSON.parse(savedLocation);
            setLocationData(location);
            if (location.address) {
                setAddress(location.address);
            }
        }
    }, []);
    
    const handleLocationSelect = (location) => {
        setLocationData(location);
        if (location.address) {
            setAddress(location.address);
        }
        localStorage.setItem('userLocation', JSON.stringify(location));
    };
    
    const handlePlaceOrder = async () => {
        if(!address || !houseNo || !customerName || !mobile || !locationData) {
            toast.error("Please fill all required fields!");
            return;
        }

        const orderData = {
            items: cartItems.map((item) => ({
                food: item._id,
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount: grandTotal,
            paymentMethod,
            customerName,
            mobile,
            deliveryAddress: {
                street: locationData.street || '',
                city: locationData.city || '',
                postalCode: locationData.postalCode || '',
                mapAddress: address,
                houseNo,
                landmark,
                coordinates: {
                    lat: locationData.lat,
                    lng: locationData.lng
                }
            }
        };

        if (paymentMethod === "cod") {
            setLoading(true);
            try {
                await API.post("/orders", orderData);
                clearCart();
                toast.success("Order placed successfully!");
                navigate("/orders");
            } catch (err) {
                toast.error(err.response?.data?.message || "Order failed!");
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post("/payment/create-order", {
                amount: grandTotal,
            });

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Feasto",
                description: "Food Order Payment",
                order_id: data.orderId,

                method: {
                    upi: true,
                },

                handler: async (response) => {
                    try {
                        await API.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData,
                        });

                        clearCart();
                        toast.success("Order placed successfully!");
                        navigate("/orders");
                    } catch (err) {
                        toast.error("Payment verification failed!");
                    }
                },

                prefill: {
                    name: user.name,
                    email: user.email,
                },

                theme: {
                    color: "#FF6B35",
                },

                modal: {
                    ondismiss: () => {
                        toast.error("Payment cancelled!");
                        setLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err) {
            toast.error(err.response?.data?.message || "Payment failed!");
            setLoading(false);
        }
    };

   if(cartItems.length === 0) {
    return (
        <div className="min-h-full flex flex-col items-center justify-center my-20">
            <MdShoppingCart className="text-orange-500 text-6xl mb-2" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Your cart is empty!
            </h1>
            <p className="text-gray-500 mb-6">
                Looks like you haven't added anything yet.
            </p>
            <Link to="/menu" className="bg-orange-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-orange-600 transition cursor-pointer">
                Browse Menu
            </Link>
        </div>
    );
   }

   return (
    <section className="min-h-screen max-w-7xl mx-auto px-6 pt-5 pb-16 bg-white">

            <PageHeader icon={MdShoppingCart} badge="YOUR CART" title="Your Order Summary" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/*Food details*/}
                <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-12 lg:self-start">
                    {cartItems.map((item) => (
                        <div 
                            key={item._id}
                            className="flex items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-slate-100 bg-white p-3 sm:p-4 shadow-[0_0_20px_rgba(15,23,50,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(249,115,100,0.15)]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0">
                                {item.image ? (
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xl sm:text-2xl font-bold">
                                        {item.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="italic text-xs text-blue-800">{item.category}</h3>
                                <p className="font-bold text-sm sm:text-lg text-gray-800 truncate">{item.name}</p>
                                <p className="font-semibold text-sm sm:text-base text-gray-800">₹{item.price}</p>  
                            </div>

                            <div className="flex flex-col gap-2 items-end">

                                <div className="flex items-center rounded-full bg-gray-200">
                                    <button
                                        onClick={() => decreaseQuantity(item._id)}
                                        type="button"
                                        className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center text-black transition hover:opacity-70 cursor-pointer"
                                    >
                                        <HiMinusCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </button>
                                    <span className="font-semibold text-black text-sm sm:text-lg px-2 sm:px-3">{item.quantity}</span>
                                    <button
                                        onClick={() => increaseQuantity(item._id)}
                                        type="button"
                                        className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center text-black transition hover:opacity-70 cursor-pointer"
                                    >
                                        <HiPlusCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </button>
                                </div>

                                <div className="flex gap-2 sm:gap-3 items-center">
                                    <p className="font-bold text-base sm:text-lg text-orange-500">
                                        ₹{item.price * item.quantity}
                                    </p>

                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-gray-400 text-lg sm:text-xl hover:text-red-500 transition cursor-pointer"
                                    >
                                        <MdDelete/>
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            
                {/*Address & Payment*/}
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white rounded-2xl p-6 shadow-[0_0_20px_rgba(15,23,50,0.10)]">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Bill Summary
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-800">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Charge</span>
                                <span className="font-semibold text-gray-800">₹{deliveryCharge}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-gray-800 text-lg">
                                <span>Grand Total</span>
                                <span className="text-orange-500">₹{grandTotal}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-[0_0_20px_rgba(15,23,50,0.10)]">

                        <div className="mb-4">
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <FaLocationDot className="text-orange-500 text-md"/>
                                Delivery Location
                            </label>
                            <LocationPicker 
                                onLocationSelect={handleLocationSelect}
                                initialLocation={locationData}
                                height="300px"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                Selected Address <span className="text-red-500">*</span>
                            </label>
                            <div className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg min-h-[60px] flex items-center">
                                {address ? (
                                    <p className="text-sm text-gray-800">{address}</p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Please select a location from the map above</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                House No / Building No <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={houseNo}
                                onChange={(e) => setHouseNo(e.target.value)}
                                placeholder="Enter house/flat/building number"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition text-gray-700"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                Nearby Landmark (Optional)
                            </label>
                            <input
                                type="text"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                placeholder="E.g., Near City Mall, Opposite Park"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition text-gray-700"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition text-gray-700"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="Enter your mobile number"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition text-gray-700"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Payment Method</label>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("cod")}
                                    className={`p-3 border-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                                        paymentMethod === "cod" 
                                            ? "border-orange-500 bg-orange-50 text-orange-700" 
                                            : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                                    }`}
                                >
                                    <BsCashStack className="text-xl shrink-0" />
                                    <div className="text-left flex-1">
                                        <p className="font-semibold text-sm">Cash on Delivery</p>
                                        <p className="text-xs opacity-75">Pay when you receive</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("online")}
                                    className={`p-3 border-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                                        paymentMethod === "online" 
                                            ? "border-orange-500 bg-orange-50 text-orange-700" 
                                            : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                                    }`}
                                >
                                    <FaCreditCard className="text-xl shrink-0" />
                                    <div className="text-left flex-1">
                                        <p className="font-semibold text-sm">Online Payment</p>
                                        <p className="text-xs opacity-75">UPI, Card, Net Banking</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-orange-500 text-white font-semibold text-xl hover:bg-orange-600 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {loading ? "Placing Order..." : paymentMethod === "cod" ? "Place Order" : "Proceed to payment"}
                        </button>

                    </div>
                </div>
            </div>
    </section>
   );
   
}

export default Cart;