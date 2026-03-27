import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineRestaurantMenu, MdSearch, MdShoppingCart } from "react-icons/md";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Menu() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const { addToCart, cartItems } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFoods = async () => {
            setLoading(true);
            setError("");

            try {
                const { data } = await API.get("/foods");
                setFoods(data);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load menu right now.");
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);

    const categories = ["All", ...new Set(foods.map((food) => food.category))];

    const filteredFoods = foods.filter((food) => {
        const matchesCategory =
            selectedCategory === "All" || food.category === selectedCategory;
        const matchesSearch =
            food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            food.description.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const availableFoods = foods.filter((food) => food.isAvailable).length;

    const handleAddToCart = (food) => {
        if (!user) {
            toast.error("Please login to add items to your cart.");
            navigate("/login");
            return;
        }

        if (user.role !== "user") {
            toast.error("Only customers can add food to the cart.");
            return;
        }

        if (!food.isAvailable) {
            toast.error("This item is currently unavailable.");
            return;
        }

        addToCart(food);
        toast.success(`${food.name} added to cart.`);
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f2_0%,#ffffff_35%,#fffaf6_100%)] px-4 py-8 md:px-8 lg:px-16">
            <section className="mx-auto mb-8 max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="grid gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.35fr_0.9fr] lg:px-14 lg:py-14">
                    <div className="space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                            <MdOutlineRestaurantMenu className="text-lg" />
                            Fresh Picks From Feasto
                        </span>

                        <div className="space-y-4">
                            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                                Explore a bold menu built for cravings, comfort, and quick delivery.
                            </h1>
                            <p className="max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
                                Browse our latest dishes, filter by category, and add your favorites to the cart in one tap.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="min-w-[150px] rounded-3xl border border-orange-100 bg-orange-50 px-5 py-4">
                                <p className="text-sm text-slate-500">Total Dishes</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{foods.length}</p>
                            </div>
                            <div className="min-w-[150px] rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4">
                                <p className="text-sm text-slate-500">Available Now</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{availableFoods}</p>
                            </div>
                            <div className="min-w-[150px] rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                                <p className="text-sm text-slate-500">Cart Items</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{cartItems.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative rounded-[2rem] bg-[radial-gradient(circle_at_top,#ffedd5_0%,#fdba74_45%,#fb923c_100%)] p-6 text-white shadow-inner">
                        <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute bottom-6 left-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />

                        <div className="relative flex h-full flex-col justify-between gap-6">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-orange-100">Chef's Note</p>
                                <h2 className="mt-3 text-3xl font-bold leading-tight">
                                    Good food should feel exciting before the first bite.
                                </h2>
                            </div>

                            <div className="rounded-3xl bg-white/15 p-5 backdrop-blur-sm">
                                <p className="text-sm text-orange-50">
                                    Start with the menu, build your cart, then we will connect the same flow directly to checkout and order tracking.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 rounded-[1.75rem] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-md">
                        <MdSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search dishes or ingredients"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    selectedCategory === category
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                        : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)]"
                            >
                                <div className="h-48 animate-pulse rounded-[1.5rem] bg-slate-100" />
                                <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-slate-100" />
                                <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
                                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                                <div className="mt-5 h-10 w-full animate-pulse rounded-full bg-slate-100" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-[1.75rem] border border-red-100 bg-red-50 px-6 py-10 text-center shadow-sm">
                        <h3 className="text-xl font-semibold text-red-600">Something went wrong</h3>
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                    </div>
                )}

                {!loading && !error && filteredFoods.length === 0 && (
                    <div className="rounded-[1.75rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                        <h3 className="text-2xl font-semibold text-slate-800">No dishes found</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Try changing the search term or choose a different category.
                        </p>
                    </div>
                )}

                {!loading && !error && filteredFoods.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredFoods.map((food) => (
                            <article
                                key={food._id}
                                className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(249,115,22,0.15)]"
                            >
                                <div className="relative h-52 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#fff1e6_0%,#fed7aa_100%)]">
                                    {food.image ? (
                                        <img
                                            src={food.image}
                                            alt={food.name}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-5xl font-bold uppercase text-orange-300">
                                            {food.name.charAt(0)}
                                        </div>
                                    )}

                                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                                        {food.category}
                                    </span>

                                    <span
                                        className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
                                            food.isAvailable
                                                ? "bg-emerald-100 text-emerald-600"
                                                : "bg-slate-200 text-slate-500"
                                        }`}
                                    >
                                        {food.isAvailable ? "Available" : "Unavailable"}
                                    </span>
                                </div>

                                <div className="mt-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{food.name}</h2>
                                        <p className="mt-1 text-sm text-slate-500">{food.description}</p>
                                    </div>
                                    <p className="whitespace-nowrap text-xl font-bold text-orange-500">
                                        Rs. {food.price}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleAddToCart(food)}
                                    disabled={!food.isAvailable}
                                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                                        food.isAvailable
                                            ? "bg-slate-900 text-white hover:bg-orange-500"
                                            : "cursor-not-allowed bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    <MdShoppingCart className="text-lg" />
                                    {food.isAvailable ? "Add to Cart" : "Currently Unavailable"}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Menu;
