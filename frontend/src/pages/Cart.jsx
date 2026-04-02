import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { MdDelete, MdShoppingCart, MdLocationOn } from "react-icons/md";
import { HiPlusCircle, HiMinusCircle } from "react-icons/hi2";
import { FaLocationDot } from "react-icons/fa6";

function Cart() {
    const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, totalAmount, clearCart } = useCart();
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const deliveryCharge = 40;
    const grandTotal = totalAmount + deliveryCharge;
    
    const handlePlaceOrder = async () => {
        if(!address) {
            toast.error("Please enter delivery address!");
            return;
        }

        setLoading(true);
        try {
            await API.post("/orders", {
                items: cartItems.map((item) => ({
                    food: item._id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                address,
                paymentMethod,
                totalAmount: grandTotal,
            });

            clearCart();
            toast.success("Order placed successfully!");
            navigate("/orders");

        } catch(err) {
            toast.error(err.response?.data?.message || "Failed to place order!");
        }
        finally {
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

            <div className="mb-10 flex flex-col items-center">
                <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                    <MdShoppingCart className="inline-block mr-1 w-5 h-5" />
                    YOUR CART
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                    Your Order Summary
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                <div className="lg:col-span-3 space-y-4">
                    {cartItems.map((item) => (
                        <div 
                            key={item._id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_0_20px_rgba(15,23,50,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(249,115,100,0.15)]"
                        >
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                {item.image ? (
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-2xl font-bold">
                                        {item.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 ml-4">
                                <h3 className="italic text-sm text-blue-800">{item.category}</h3>
                                <p className="font-bold text-lg text-gray-800">{item.name}</p>
                                <p className="font-semibold text-gray-800">₹{item.price}</p>  
                            </div>

                            <div className="flex flex-col lg:flex-row">

                                <div className="h-10 w-full flex items-center justify-between rounded-full bg-gray-200 px-0 sm:w-30">
                                    <button
                                        onClick={() => decreaseQuantity(item._id)}
                                        type="button"
                                        className="flex h-12 w-12 items-center justify-center text-black transition hover:opacity-70 cursor-pointer"
                                    >
                                        <HiMinusCircle className="h-7 w-7" />
                                    </button>
                                    <span className="font-semibold text-black text-xl">{item.quantity}</span>
                                    <button
                                        onClick={() => increaseQuantity(item._id)}
                                        type="button"
                                        className="flex h-12 w-12 items-center justify-center text-black transition hover:opacity-70 cursor-pointer"
                                    >
                                        <HiPlusCircle className="h-7 w-7" />
                                    </button>
                                </div>

                                <div className="flex gap-4 items-center justify-center mt-4 lg:mt-0">
                                    <p className="font-bold text-lg text-orange-500 w-16 text-right">
                                        ₹{item.price * item.quantity}
                                    </p>

                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-gray-400 text-lg hover:text-red-500 transition cursor-pointer"
                                    >
                                        <MdDelete/>
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-[0_0_20px_rgba(15,23,50,0.10)] sticky top-24">

                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Order Total
                        </h2>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-800">₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className="font-semibold text-gray-800">₹{deliveryCharge}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-gray-800 text-lg">
                                <span>Total</span>
                                <span className="text-orange-500">₹{grandTotal}</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <MdLocationOn className="text-orange-500"/>
                                Delivery Address
                            </label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter your delivery address"
                                className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>

                        <div>
                            <p>Payment Method</p>
                            <div>
                                <button
                                    onClick={() => setPaymentMethod("cod")}
                                    className={`w-full p-2 border border-gray-300 rounded-md ${paymentMethod === "cod" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                    Cash on Delivery
                                </button>
                                <button
                                    onClick={() => setPaymentMethod("online")}
                                    className={`w-full p-2 border border-gray-300 rounded-md ${paymentMethod === "online" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                    Online Payment
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full p-2 border border-gray-300 rounded-md bg-orange-500 text-white">
                            {loading ? "Placing Order..." : "Place Order"}
                        </button>

                    </div>
                </div>
            </div>
    </section>
   );
   
}

export default Cart;