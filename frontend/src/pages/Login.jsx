import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import illustration from "../assets/illustration.png";
import logo from "../assets/logo.png"
import { MdEmail, MdLock } from "react-icons/md";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const { data } = await API.post("/users/login", { email, password });

            login(data, data.token);

            toast.success(`Welcome back, ${data.name}!`);

            if(data.role === "admin") {
                navigate("/admin");
            } else if(data.role === "deliveryBoy") {
                navigate("/delivery");
            } else {
                navigate("/");
            }
        } catch(err) {
            toast.error(err.response?.data?.message || "Login failed!");
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
                    className="max-w-md lg:max-w-xl"
                />
            </div>

            {/*Right side*/}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8">

                <img
                    src={logo}
                    alt="Feasto logo"
                    className="h-12 mb-8"
                />

                <div className="w-full max-w-md text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back :)</h1>
                    <p className="text-sm text-gray-400">Your favourite food is just one login away.</p>
                </div>
                
                <div className="w-full max-w-md">
                    <form className="w-full space-y-4">

                        <div className="flex flex-col items-left">

                            <label className="text-gray-500 text-sm m-2">Email Address</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200 ">
                                <MdEmail className="text-gray-500 text-xl mr-3 shrink-0"/>
                                <input type="email" placeholder="Enter your email" className="flex-1 focus:outline-none text-gray-700 text-sm " />
                            </div>

                            <label className="text-gray-500 text-sm m-2">Password</label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200">
                                <MdLock className="text-gray-500 text-xl mr-3 shrink-0"/>
                                <input type="password" placeholder="Enter your password" className="flex-1 focus:outline-none text-gray-700 text-sm " />
                            </div>
                            
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full transition cursor-pointer">Login Now</button>
                            <button type="button" className="flex-1 border border-gray-300 text-gray-600 rounded-full hover:border-orange-500 hover:text-orange-500 transition cursor-pointer">Create Account</button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )

}

export default Login;