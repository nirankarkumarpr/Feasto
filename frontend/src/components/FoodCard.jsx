import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { HiPlusCircle, HiMinusCircle } from "react-icons/hi2";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";


function FoodCard({ food }) {
    const { addToCart, increaseQuantity, decreaseQuantity, getItemQuantity } = useCart();

    const quantity = getItemQuantity(food._id);
    const navigate = useNavigate();
    const { user } = useAuth();

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
        <article className="group overflow-hidden rounded-4xl border border-slate-100 bg-white p-5 shadow-[0_0_100px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(249,115,22,0.15)]">
            <div className="relative h-56 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#fff1e6_0%,#fed7aa_100%)]">
                
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

            </div>

            <div className="mt-5 flex items-left flex-col justify-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{food.name}</h2>
                <span className="flex font-bold text-lg text-orange-500">
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiOutlineStar />
                </span>
                <p className="text-sm text-slate-500 line-clamp-2">
                    {food.description}
                </p>
            </div>

            <div className="mt-6 flex w-full flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="whitespace-nowrap text-2xl font-bold text-orange-500">
                    ₹{food.price}
                </p>

                {quantity === 0 ? (
                    <button
                        type="button"
                        onClick={() => handleAddToCart(food)}
                        disabled={!food.isAvailable}
                        className={`flex h-10 w-full items-center justify-center gap-2 rounded-full px-0 text-sm font-semibold transition sm:w-30 cursor-pointer ${
                            food.isAvailable
                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                : "cursor-not-allowed bg-slate-100 text-slate-400"
                        }`}
                    >
                        {food.isAvailable ? "Add to Cart" : "Out of Stock!"}
                    </button>
                ) : (
                    <div className="flex h-10 w-full items-center justify-between rounded-full bg-gray-200 px-0 sm:w-30">
                        <button
                            onClick={() => decreaseQuantity(food._id)}
                            type="button"
                            className="flex h-12 w-12 items-center justify-center text-black transition hover:opacity-70 cursor-pointer"
                        >
                            <HiMinusCircle className="h-7 w-7" />
                        </button>
                        <span className="font-semibold text-xl">{quantity}</span>
                        <button
                            onClick={() => increaseQuantity(food._id)}
                            type="button"
                            className="flex h-12 w-12 items-center justify-center text-black transition hover:opacity-70 cursor-pointer"
                        >
                            <HiPlusCircle className="h-7 w-7" />
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}

export default FoodCard;