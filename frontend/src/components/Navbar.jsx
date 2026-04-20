import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { MdShoppingCart, MdLogout, MdDashboard, MdDeliveryDining, MdClose, MdChevronRight } from "react-icons/md";
import { HiSquares2X2 } from "react-icons/hi2";
import { IoCloseCircle } from "react-icons/io5";
import logo from "../assets/logo.png";
import { useState, useEffect, useRef } from "react";
import LocationPicker from "./map/LocationPicker";

function Navbar() {
    const { user, logout } = useAuth();
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const locationModalRef = useRef(null);

    useEffect(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            setCurrentLocation(JSON.parse(savedLocation));
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (locationModalRef.current && !locationModalRef.current.contains(event.target)) {
                setIsLocationModalOpen(false);
            }
        };

        if (isLocationModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocationModalOpen]);

    const handleLogout = () => {
        logout();
        clearCart();
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLocationSave = (location) => {
        setCurrentLocation(location);
        localStorage.setItem('userLocation', JSON.stringify(location));
        setIsLocationModalOpen(false);
    };

    const getShortAddress = (address) => {
        if (!address) return "Select location";
        const parts = address.split(',');
        return parts.slice(0, 2).join(',');
    };

    return (
        <nav className="relative w-full bg-white px-8 lg:px-18 py-8 flex items-center justify-between">

            <div className="flex items-center gap-5">
                <Link to="/">
                    <img src={logo} alt="Feasto Logo" className="h-8 md:h-10" />
                </Link>

                {user && user.role === "user" && (
                    <div className="relative" ref={locationModalRef}>
                        <button
                            onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
                            className="flex items-center text-gray-600 bg-gray-50 border-gray-300 border rounded-full px-3 sm:px-8 py-2 text-xs sm:text-sm font-medium hover:bg-gray-100 transition cursor-pointer h-8 sm:h-10"
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-800">Hello, {user?.name}</span>
                                <span className="hidden sm:inline text-gray-400">|</span>
                                <span className="hidden sm:flex items-center gap-0.5 text-orange-500 text-xs font-semibold">
                                    {getShortAddress(currentLocation?.address)}
                                    <MdChevronRight className="text-sm" />
                                </span>
                            </div>
                        </button>
                        
                        {isLocationModalOpen && (
                            <>
                                {/* Mobile: Fixed centered popup */}
                                <div className="md:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-[9999] flex items-center justify-center p-4">
                                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-bold text-gray-800">Select Location</h3>
                                                <button
                                                    onClick={() => setIsLocationModalOpen(false)}
                                                    className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                                >
                                                    <MdClose className="text-xl" />
                                                </button>
                                            </div>
                                            
                                            <LocationPicker
                                                onLocationSelect={handleLocationSave}
                                                initialLocation={currentLocation}
                                                height="250px"
                                            />
                                            
                                            {currentLocation && currentLocation.address && (
                                                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                                    <p className="text-[10px] text-orange-600 font-semibold mb-0.5">Selected:</p>
                                                    <p className="text-xs text-gray-800">{currentLocation.address}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop: Dropdown below button */}
                                <div className="hidden md:block absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] w-96">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-gray-800">Select Location</h3>
                                            <button
                                                onClick={() => setIsLocationModalOpen(false)}
                                                className="text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <MdClose className="text-xl" />
                                            </button>
                                        </div>
                                        
                                        <LocationPicker
                                            onLocationSelect={handleLocationSave}
                                            initialLocation={currentLocation}
                                            height="250px"
                                        />
                                        
                                        {currentLocation && currentLocation.address && (
                                            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                                <p className="text-[10px] text-orange-600 font-semibold mb-0.5">Selected:</p>
                                                <p className="text-xs text-gray-800">{currentLocation.address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {user && user.role !== "user" && (
                    <span className="flex items-center text-gray-600 bg-gray-50 border-gray-300 border rounded-full px-3 sm:px-8 py-2 text-xs sm:text-sm font-medium h-8 sm:h-10">
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

                        {user && user.role === "user" && (
                            <div className="pb-4 border-b border-gray-200">
                                <button
                                    onClick={() => setIsLocationModalOpen(!isLocationModalOpen)}
                                    className="w-full flex items-center justify-between text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Current Location</p>
                                        <p className="text-sm font-semibold text-orange-500 flex items-center gap-1">
                                            {getShortAddress(currentLocation?.address)}
                                            <MdChevronRight className="text-base" />
                                        </p>
                                    </div>
                                </button>
                            </div>
                        )}

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