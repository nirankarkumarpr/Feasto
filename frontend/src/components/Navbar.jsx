import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { MdShoppingCart, MdLogout, MdDashboard, MdDeliveryDining, MdClose } from "react-icons/md";
import { HiSquares2X2 } from "react-icons/hi2";
import { IoCloseCircle } from "react-icons/io5";
import logo from "../assets/logo.png";
import { useState } from "react";

function Navbar() {
    const { user, logout } = useAuth();
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        clearCart();
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="relative w-full bg-white px-8 lg:px-18 py-8 flex items-center justify-between">

            <div className="flex items-center gap-5">
                <Link to="/">
                    <img src={logo} alt="Feasto Logo" className="h-8 md:h-10" />
                </Link>

                {user && (
                    <span className="flex items-center text-gray-600 bg-gray-50 border-gray-300 border rounded-full px-3 sm:px-8 py-2 text-xs sm:text-sm font-medium">
                        Hello, {user?.name}
                    </span>
                )}
            </div>

            <div className="hidden md:flex items-center gap-10">
                <Link to="/" className="text-gray-600 hover:text-orange-500 transition font-medium text-md">Home</Link>
                <Link to="/menu" className="text-gray-600 hover:text-orange-500 transition font-medium text-md">Menu</Link>

                {user && user.role === "user" && (
                    <>
                        <Link to="/orders" className="text-gray-600 hover:text-orange-500 transition font-medium text-md">My Orders</Link>
                        <Link to="/cart" className="relative text-gray-600 hover:text-orange-500 transition">
                            <MdShoppingCart className="text-3xl"/>
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" >
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                    </>
                )}

                {user && user.role === "admin" && (
                    <Link to="/admin" className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition font-medium text-md">
                        <MdDashboard />
                        Dashboard
                    </Link>
                )}

                {user && user.role === "deliveryBoy" && (
                    <Link to="/delivery" className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition font-medium text-md">
                        <MdDeliveryDining className="text-2xl" />
                        My Deliveries
                    </Link>
                )}

                {!user && (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-orange-500 transition font-medium text-md">Login</Link>
                        <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition font-medium text-md">Register</Link>
                    </>
                )}

                {user && (
                    <div className="flex items-center gap-3">
                        <button onClick={handleLogout} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition font-medium text-md cursor-pointer">
                            Logout
                            <MdLogout />
                        </button>
                    </div>
                )}

            </div>

            <div className="flex md:hidden items-center justify-between gap-4">
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-600 hover:text-orange-500 transition cursor-pointer"
                >
                    {isMobileMenuOpen ? <IoCloseCircle className="text-3xl" /> : <HiSquares2X2 className="text-3xl" />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-2xl md:hidden z-50 border-t border-gray-200">
                    <div className="flex flex-col p-6 gap-4">

                        <Link to="/" onClick={closeMobileMenu} className="text-gray-600 hover:text-orange-500 transition font-medium text-md py-2">Home</Link>
                        <Link to="/menu" onClick={closeMobileMenu} className="text-gray-600 hover:text-orange-500 transition font-medium text-md py-2">Our Menu</Link>

                        {user && user.role === "user" && (
                            <>
                                <Link to="/orders" onClick={closeMobileMenu} className="text-gray-600 hover:text-orange-500 transition font-medium text-md py-2">Your Orders</Link>
                                
                                <Link to="/cart" onClick={closeMobileMenu} className="flex items-center justify-between text-gray-600 hover:text-orange-500 transition font-medium text-md py-2">
                                    <span className="flex items-center gap-2">
                                        <MdShoppingCart className="text-xl" />
                                        Your Cart
                                    </span>
                                    {cartItems.length > 0 && (
                                        <span className="bg-orange-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {user && user.role === "admin" && (
                            <Link to="/admin" onClick={closeMobileMenu} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition font-medium text-md py-2">
                                <MdDashboard />
                                Dashboard
                            </Link>
                        )}

                        {user && user.role === "deliveryBoy" && (
                            <Link to="/delivery" onClick={closeMobileMenu} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition font-medium text-md py-2">
                                <MdDeliveryDining className="text-2xl" />
                                My Deliveries
                            </Link>
                        )}

                        {!user && (
                            <>
                                <Link to="/login" onClick={closeMobileMenu} className="text-gray-600 hover:text-orange-500 transition font-medium text-md py-2">Login</Link>
                                <Link to="/register" onClick={closeMobileMenu} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition font-medium text-md text-center">Register</Link>
                            </>
                        )}

                        {user && (
                            <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition font-medium text-md cursor-pointer mt-2">
                                Logout
                                <MdLogout />
                            </button>
                        )}
                    </div>
                </div>
            )}

        </nav>
    );
}

export default Navbar;