import { Link } from "react-router-dom";
import logos from "../assets/logo.png";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LiaFacebook } from "react-icons/lia";
import { IoSend } from "react-icons/io5";

function Footer() {
    return (
        <footer className="w-full bg-gray-50 py-12">
            <div className="mx-auto max-w-7xl px-12">

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12">

                    <div className="w-full flex flex-col lg:col-span-3">
                        <Link to="/">
                            <img
                                src={logos}
                                alt="Feasto logo"
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="mt-4 pr-10 text-sm text-gray-600">
                        We make sure your tummy is filled with delicious food, delivered quickly to your door.
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <LiaFacebook className="text-2xl text-gray-800 hover:text-orange-500 cursor-pointer transition"/ >
                            <FaInstagram className="text-xl text-gray-800 hover:text-orange-500 cursor-pointer transition"/ >
                            <FaXTwitter className="text-xl text-gray-800 hover:text-orange-500 cursor-pointer transition"/ >
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold tracking-wide text-gray-900 mb-4">
                            About
                        </h3>
                        <ul className="mb-2 space-y-2 text-sm font-semibold text-gray-500">
                            <li><Link to="#" className="hover:text-orange-500 transition cursor-pointer">About Us</Link></li>
                            <li><Link to="#" className="hover:text-orange-500 transition cursor-pointer">Features</Link></li>
                            <li><Link to="#" className="hover:text-orange-500 transition cursor-pointer">News</Link></li>
                            <li><Link to="/menu" className="hover:text-orange-500 transition cursor-pointer">Menu</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold tracking-wide text-gray-900 mb-4">
                            Company
                        </h3>
                        <ul className="mb-2 space-y-2 text-sm font-semibold text-gray-500">
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">Why Feasto?</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">Partner With Us</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">FAQ</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">Blog</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold tracking-wide text-gray-900 mb-4">
                            Support
                        </h3>
                        <ul className="mb-2 space-y-2 text-sm font-semibold text-gray-500">
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">Account</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">Support Center</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">Feedback</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition cursor-pointer">Contact Us</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-3">
                        <h3 className="text-lg font-bold tracking-wide text-gray-900 mb-4">
                            Get in Touch
                        </h3>

                        <p className="text-sm font-semibold text-gray-700">
                            Question or feedback? <br/>
                            We'd love to hear from you.
                        </p>

                        <div className="mt-4 flex w-full items-center rounded-full border border-gray-300 px-4 py-2">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                aria-label="Send"
                                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 cursor-pointer"
                            >
                                <IoSend className="text-lg" />
                            </button>
                        </div>
                    </div>

                </div>

                <div className="mt-8 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
                    © 2026 Feasto. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;