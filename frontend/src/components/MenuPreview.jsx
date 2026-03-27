import { useState, useEffect } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";
import FoodCard from "./FoodCard";
import { BiSolidDish } from "react-icons/bi";
import { FaAngleRight } from "react-icons/fa6";

function MenuPreview() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFoods = async() => {
            try {
                const { data } = await API.get("/foods");
                setFoods(data);
            } catch(err) {
                console.error("Failed to fetch foods:", err);
            } finally {
                setLoading(false);  
        }
    };
    fetchFoods();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (foods.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-700">
                    No foods available
                </h2>

                <p className="text-gray-500 mt-2">
                    Please wait for admin to add foods.
                </p>
            </div>
        );
    }

    return (
        <section className="w-full pb-16 bg-white">

            <div className="max-w-7xl mx-auto px-6 text-center">
                <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
                    <BiSolidDish className="inline-block mr-1 w-5 h-5" />
                    OUR MENU
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                    Popular Dishes
                </h2>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {foods.slice(0, 4).map((food) => (
                    <FoodCard key={food._id} food={food} />
                ))}
            </div>

            <div className="text-center mt-10">
                <Link to="/menu" className="inline-flex items-center justify-center text-gray-900 border border-2 rounded-full px-5 py-2 font-semibold hover:text-orange-600 transition">
                    View Full Menu &nbsp;
                    <FaAngleRight />
                </Link>
            </div>

        </section>
    );
}

export default MenuPreview;