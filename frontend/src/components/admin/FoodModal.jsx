import { useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { MdClose, MdEdit, MdAdd } from "react-icons/md";

function FoodModal({ foodForm, setFoodForm, setShowFoodModal, fetchData }) {
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(foodForm.image || "");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", foodForm.name);
      formData.append("description", foodForm.description);
      formData.append("price", Number(foodForm.price));
      formData.append("category", foodForm.category);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (foodForm.id) {
        await API.put(`/foods/${foodForm.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Food item updated successfully!");
      } else {
        await API.post("/foods", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Food item added successfully!");
      }

      fetchData();
      setShowFoodModal(false);
    } catch (err) {
      toast.error("Failed to save food item!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={() => setShowFoodModal(false)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {foodForm.id ? "Edit Food Item" : "Add New Food Item"}
            </h2>

            <button
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              onClick={() => setShowFoodModal(false)}
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={foodForm.name}
                    onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
                    required
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  
                  <textarea
                    value={foodForm.description}
                    onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                    className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                  
                  <input
                    type="number"
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  
                  <input
                    type="text"
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 transition-all duration-200"
                    placeholder="e.g., Pizza, Burger, Dessert"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Food Image</label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-orange-400 transition flex-1 min-h-[320px]">
                  {imagePreview ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition cursor-pointer z-10"
                      >
                        <MdClose className="w-5 h-5" />
                      </button>
                      
                      <label className="absolute bottom-2 left-2 right-2 z-10">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition cursor-pointer shadow-lg">
                          <MdEdit className="w-4 h-4" />
                          
                          <span className="text-sm font-semibold">Change Image</span>
                        </div>
                        
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer group">
                      <MdAdd className="w-16 h-16 text-gray-400 group-hover:text-orange-500 transition mb-2" />
                      
                      <p className="text-gray-600 font-semibold mb-1">Click to upload image</p>
                      
                      <p className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</p>
                      
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                        required={!foodForm.id && !imagePreview}
                      />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer mt-4"
                >
                  {submitting ? "Saving..." : foodForm.id ? "Update Item" : "Add Item"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FoodModal;