import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import illustration from "../assets/illustration.png";
import logo from "../assets/logo.png"
import { MdEmail, MdLock, MdPerson } from "react-icons/md";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post("/users/register", { name, email, password, role });

            login(data, data.token);

            toast.success(`Welcome, ${data.name}!`);
            navigate("/");
        } catch(err) {
            toast.error(err.response?.data?.message || "Registration failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">

            {/*Left side*/}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-16">
                <img
                    src={illustration}
                    alt="Food Delivery"
                    className="w-full max-w-md lg:max-w-3xl"
                />
            </div>

            {/*Right side*/}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8 ">
                
                <Link to="/">
                    <img
                        src={logo}
                        alt="Feasto logo"
                        className="h-12 mb-8"
                    />
                </Link>

                <div className="w-full max-w-md text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account :)</h1>
                    <p className="text-sm text-gray-400">You are just one step away from ordering delicious food.</p>
                </div>
                
                <div className="w-full max-w-md">
                    <form onSubmit={handleSubmit} className="w-full space-y-4">

                        <div className="flex flex-col items-left">

                            <label className="text-gray-500 text-sm m-2">Full Name</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200 ">
                                <MdPerson className="text-gray-500 text-xl mr-3 shrink-0"/>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="flex-1 focus:outline-none text-gray-700 text-sm"
                                />
                            </div>

                            <label className="text-gray-500 text-sm m-2">Email Address</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200 ">
                                <MdEmail className="text-gray-500 text-xl mr-3 shrink-0"/>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 focus:outline-none text-gray-700 text-sm"
                                />
                            </div>

                            <label className="text-gray-500 text-sm m-2">Select Role</label>
                            <div className="flex gap-3">
                                <label className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-orange-300 transition-all duration-200" style={{borderColor: role === 'user' ? '#f97316' : ''}}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="user"
                                        checked={role === 'user'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-4 h-4 appearance-none border-2 border-gray-300 rounded-full cursor-pointer checked:bg-orange-500 checked:border-orange-500"
                                    />
                                    <span className="text-gray-700 text-sm font-medium">Customer</span>
                                </label>
                                <label className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-orange-300 transition-all duration-200" style={{borderColor: role === 'admin' ? '#f97316' : ''}}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                        checked={role === 'admin'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-4 h-4 appearance-none border-2 border-gray-300 rounded-full cursor-pointer checked:bg-orange-500 checked:border-orange-500"
                                    />
                                    <span className="text-gray-700 text-sm font-medium">Admin</span>
                                </label>
                                <label className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-orange-300 transition-all duration-200" style={{borderColor: role === 'deliveryBoy' ? '#f97316' : ''}}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="deliveryBoy"
                                        checked={role === 'deliveryBoy'}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-4 h-4 appearance-none border-2 border-gray-300 rounded-full cursor-pointer checked:bg-orange-500 checked:border-orange-500"
                                    />
                                    <span className="text-gray-700 text-sm font-medium">Delivery Boy</span>
                                </label>
                            </div>

                            <label className="text-gray-500 text-sm m-2">Password</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200">
                                <MdLock className="text-gray-500 text-xl mr-3 shrink-0"/>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="flex-1 focus:outline-none text-gray-700 text-sm"
                                />
                            </div>

                            <label className="text-gray-500 text-sm m-2">Confirm Password</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200">
                                <MdLock className="text-gray-500 text-xl mr-3 shrink-0"/>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your password"
                                    required
                                    className="flex-1 focus:outline-none text-gray-700 text-sm"
                                />
                            </div>
                            
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full transition cursor-pointer"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                            <Link to="/login" className="flex-1 border border-gray-300 text-gray-600 rounded-full hover:border-orange-500 hover:text-orange-500 transition cursor-pointer flex items-center justify-center py-3">Login</Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )

}

export default Register;