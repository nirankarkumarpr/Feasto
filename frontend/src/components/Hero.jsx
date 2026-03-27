import hero from "../assets/heroSection.png";
import { BsFillLightningFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";

function Hero() {
    return (
        <section className="w-full min-h-[80vh] pt-5 pb-16 bg-white">

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">

            <div className="flex-1">
                <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
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
                    <Link to="/menu"className="bg-orange-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-orange-600 transition cursor-pointer">
                        Order Now
                    </Link>

                    <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                        <span className="flex font-bold text-lg text-orange-500">
                            <AiFillStar />
                            <AiFillStar />
                            <AiFillStar />
                            <AiFillStar />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">4 star rating</p>
                            <p className="text-xs text-gray-400">based on 954 reviews</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex-1 mt-10 md:mt-0 transition duration-300 ease-in-out hover:scale-105">
                <img src={hero} alt="Delicious food delivery" className="w-full max-w-lg mx-auto" />
            </div>

        </div>

        </section>
    );
}

export default Hero;

