import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { MdShoppingCart, MdLogout, MdDashboard, MdDeliveryDining } from "react-icons/md";
import logo from "../assets/logo.png";

function Navbar() {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="w-full bg-white px-15 py-8 flex items-center justify-between">

            <div className="flex items-center gap-5">
                <Link to="/">
                    <img src={logo} alt="Feasto Logo" className="h-8 md:h-10" />
                </Link>

                {user && (
                    <span className="hidden md:flex items-center text-gray-600 bg-gray-50 border-gray-300 border rounded-full px-8 py-2 text-sm font-medium">
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

                {user && user.role === "user" && (
                    <Link to="/cart" className="relative text-gray-600">
                        <MdShoppingCart className="text-2xl"/>
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" >
                                {cartItems.length}
                            </span>
                        )}
                    </Link>
                )}

                {!user && (
                    <Link to="/login" className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">Login</Link>
                )}

                {user && (
                    <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 cursor-pointer">
                        <MdLogout />
                    </button>
                )}

            </div>

        </nav>
    );
}

export default Navbar;