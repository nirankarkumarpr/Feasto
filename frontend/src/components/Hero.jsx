import React from "react";
import hero from "../assets/heroSection.png";
import { BsFillLightningFill } from "react-icons/bs";

function Hero() {
    return (
        <section className="w-full py-5 bg-white">

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">

            <div className="flex-1">
                <span className="inline-block bg-orange-100 text-orange-500 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                    <BsFillLightningFill className="inline-block mr-1" />
                    Fastest Delivery
                </span>
                
                <h1 className="text-4xl md:text-7xl font-extrabold text-gray-900 mb-6">
                    Taste the Best <br />
                    <span className="text-orange-500"> Food</span>  in Town
                </h1>
                <p className="text-gray-500 text-lg mb-8 max-w-md">
                    Experience the joy of your favorite meals delivered to your doorstep anytime, anywhere.
                </p>
                
                <div className="flex items-center gap-6 mb-10">
                    <button className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition">
                        Order Now
                    </button>

                    <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                        <span className="font-bold text-orange-500">★★★★★</span>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">5 star rating</p>
                            <p className="text-xs text-gray-400">based on 1788 reviews</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex-1 mt-10 md:mt-0">
                <img src={hero} alt="Delicious food delivery" className="w-full max-w-lg mx-auto" />
            </div>

        </div>

        </section>
    );
}

export default Hero;

