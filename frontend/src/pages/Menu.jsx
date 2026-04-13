import { useState, useEffect } from "react";
import API from "../api/axios";
import FoodCard from "../components/FoodCard";
import { BiSolidDish } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import PageHeader from "../components/PageHeader";

function Menu() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", ...new Set(foods.map((food) => food.category))];

    const filteredFoods = foods.filter((food) => {
        const matchesCategory = selectedCategory === "All" || selectedCategory === food.category;

        const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

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

    return (
        <section className="w-full pb-16 bg-white">

            <PageHeader icon={BiSolidDish} badge="OUR MENU" title="Explore our Delicious Dishes" />

            <div className="max-w-7xl mx-auto px-6 mt-10 flex flex-col lg:flex-row justify-between gap-6">
                <div className="w-full lg:w-1/3 flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-3 focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200">
                    <FiSearch className="text-gray-500 text-xl mr-3 shrink-0"/>
                    <input 
                        type="text"
                        placeholder="Search for food..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 focus:outline-none text-gray-700 text-sm"
                    />
                </div>

                <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                                selectedCategory === category
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

            </div>

            {filteredFoods.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold text-gray-700">
                        No foods available
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Please wait for admin to add foods.
                    </p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredFoods.map((food) => (
                        <FoodCard key={food._id} food={food} />
                    ))}
                </div>
            )}

        </section>
    );
}

export default Menu;