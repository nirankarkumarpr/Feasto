import API from "../../api/axios";
import toast from "react-hot-toast";
import { MdEdit, MdDelete } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";

function FoodsTab({ foods, setShowFoodModal, setFoodForm, fetchData }) {
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await API.delete(`/foods/${id}`);
      toast.success("Food item deleted!");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete food item!");
    }
  };

  const handleEdit = (food) => {
    setFoodForm({
      id: food._id,
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
    });
    setShowFoodModal(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        <button
          onClick={() => {
            setFoodForm({ name: "", description: "", price: "", category: "", image: "" });
            setShowFoodModal(true);
          }}
          className="group overflow-hidden rounded-4xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50 cursor-pointer"
        >
          <div className="flex flex-col gap-4 items-center justify-center h-full min-h-[400px]">
            <CiCirclePlus className="w-24 h-24 text-slate-600 group-hover:text-orange-600 transition" />
            
            <p className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition">
              Add New Item
            </p>
          </div>
        </button>

        {foods.map((food) => (
          <article 
            key={food._id} 
            className="group overflow-hidden rounded-4xl border border-slate-100 bg-white p-5 shadow-[0_0_100px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(249,115,22,0.15)]"
          >
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

              <span className="absolute right-4 top-4 shadow-md rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                ₹{food.price}
              </span>
            </div>

            <div className="mt-5 flex items-left flex-col justify-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{food.name}</h2>
              
              <p className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
                {food.description}
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleEdit(food)}
                className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2.5 rounded-2xl text-sm font-semibold hover:bg-blue-600 transition cursor-pointer"
              >
                <MdEdit className="w-4 h-4" /> Edit
              </button>

              <button
                onClick={() => handleDelete(food._id)}
                className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2.5 rounded-2xl text-sm font-semibold hover:bg-red-600 transition cursor-pointer"
              >
                <MdDelete className="w-4 h-4" /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default FoodsTab;
