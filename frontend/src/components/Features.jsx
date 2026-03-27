import bestQuality from "../assets/bestQuality.png";
import fastDelivery from "../assets/fastestDelivery.png";
import easyToOrder from "../assets/easyToOrder.png";
import { MdDeliveryDining } from "react-icons/md";


function Features() {
    return (
        <section className="w-full pb-16">

            <div className="max-w-7xl mx-auto px-6 text-center">
                <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                    <MdDeliveryDining className="inline-block mr-1 w-5 h-5" />
                    WHAT WE SERVE
                </span>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                    Your Favourite Food <br /> Delivery Partner
                </h2>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center transition duration-300 ease-in-out hover:scale-105">
                    <div className="w-48 h-48 mx-auto bg-white flex items-center justify-center">
                        <img src={easyToOrder} alt="Easy to Order" className="w-40 h-40 object-contain" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900">
                        Easy To Order
                    </h3>

                    <p className="text-gray-600 font-semibold mx-auto mt-2 max-w-3xs">
                        Order your favorite meals with just a few clicks.
                    </p>
                </div>

                <div className="text-center transition duration-300 ease-in-out hover:scale-105">
                    <div className="w-48 h-48 mx-auto bg-white flex items-center justify-center">
                        <img src={fastDelivery} alt="Fast Delivery" className="w-40 h-40 object-contain" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900">
                        Fastest Delivery
                    </h3>

                    <p className="text-gray-600 font-semibold mx-auto mt-2 max-w-3xs">
                        Delivery at your doorstep always on time.
                    </p>
                </div>

                <div className="text-center transition duration-300 ease-in-out hover:scale-105">
                    <div className="w-48 h-48 mx-auto bg-white flex items-center justify-center">
                        <img src={bestQuality} alt="Best Quality" className="w-40 h-40 object-contain" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900">
                        Best Quality
                    </h3>

                    <p className="text-gray-600 font-semibold mx-auto mt-2 max-w-3xs">
                        Experience the best quality food with every order.
                    </p>
                </div>

            </div>

        </section>
    );
}

export default Features;