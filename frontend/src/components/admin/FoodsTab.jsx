import API from "../../api/axios";
import toast from "react-hot-toast";
import { MdEdit, MdDelete } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";

function FoodsTab({ foods, setShowFoodModal, setFoodForm, fetchData }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteClick = (food) => {
    setDeleteConfirm(food);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await API.delete(`/foods/${deleteConfirm._id}`);
      toast.success("Food item deleted!");
      fetchData();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error("Failed to delete food item!");
      setDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
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
    <>
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
          
          <button
            onClick={() => {
              setFoodForm({ name: "", description: "", price: "", category: "", image: "" });
              setShowFoodModal(true);
            }}
            className="group overflow-hidden rounded-4xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:-translate-y-1 hover:border-orange-400 hover:bg-orange-50 cursor-pointer"
          >
            <div className="flex flex-col gap-2 sm:gap-4 items-center justify-center h-full min-h-[250px] sm:min-h-[400px]">
              <CiCirclePlus className="w-12 h-12 sm:w-24 sm:h-24 text-slate-600 group-hover:text-orange-600 transition" />
              
              <p className="text-sm sm:text-xl font-bold text-slate-900 group-hover:text-orange-600 transition">
                Add New Item
              </p>
            </div>
          </button>

          {foods.map((food) => (
            <article 
              key={food._id} 
              className="group overflow-hidden rounded-2xl sm:rounded-4xl border border-slate-200 bg-white p-2.5 sm:p-5 shadow-[0_0_100px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(249,115,22,0.15)]"
            >
              <div className="relative h-32 sm:h-56 overflow-hidden rounded-xl sm:rounded-2xl bg-blue/80">
                {food.image ? (
                  <img 
                    src={food.image} 
                    alt={food.name} 
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl sm:text-5xl font-bold uppercase text-orange-300">
                    {food.name.charAt(0)}
                  </div>
                )}

                <span className="absolute left-2 top-2 sm:left-4 sm:top-4 rounded-full bg-white/90 px-1.5 py-0.5 sm:px-3 sm:py-1 text-[0.5rem] sm:text-xs font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-700">
                  {food.category}
                </span>

                <span className="absolute right-2 top-2 sm:right-4 sm:top-4 shadow-md rounded-full bg-orange-500 px-1.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold text-white">
                  ₹{food.price}
                </span>
              </div>

              <div className="mt-2 sm:mt-5 flex items-left flex-col justify-center gap-1 sm:gap-2">
                <h2 className="text-sm sm:text-xl font-bold text-slate-900 line-clamp-1">{food.name}</h2>
                
                <p className="text-[0.65rem] sm:text-sm text-slate-500 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                  {food.description}
                </p>
              </div>

              <div className="mt-3 sm:mt-6 flex gap-1 sm:gap-2">
                <button
                  onClick={() => handleEdit(food)}
                  className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 bg-blue-500 text-white px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-[0.65rem] sm:text-sm font-semibold hover:bg-blue-600 transition cursor-pointer"
                >
                  <MdEdit className="w-3 h-3 sm:w-4 sm:h-4" /> Edit
                </button>

                <button
                  onClick={() => handleDeleteClick(food)}
                  className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 bg-red-500 text-white px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl text-[0.65rem] sm:text-sm font-semibold hover:bg-red-600 transition cursor-pointer"
                >
                  <MdDelete className="w-3 h-3 sm:w-4 sm:h-4" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm w-full p-4 sm:p-6 animate-scale-in">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="bg-red-100 p-3 sm:p-4 rounded-full">
                <FaTrash className="text-2xl sm:text-3xl text-red-500" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-1 sm:mb-2">
              Delete Food Item?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FoodsTab;
