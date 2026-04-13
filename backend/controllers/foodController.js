const Food = require("../models/Food.js");
const cloudinary = require("../config/cloudinary");

// Extract public id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = `feasto_foods/${filename.split('.')[0]}`;
    return publicId;
};

//GET for fetching food data
const getAllFoods = async (req, res) => {
    try{
        const foods = await Food.find();
        res.status(200).json(foods); //SUCCESS
    } catch (err) {
        res.status(500).json({ message: err.message }); //SERVER ERROR
    }
};

//POST for creating food data
const createFood = async (req, res) => {
    try {        
        const { name, description, price, category } = req.body;
        const image = req.file ? req.file.path : "";

        const food = await Food.create({
            name,
            description,
            price,
            category,
            image,
        });
        
        res.status(201).json(food);
    } catch (err) {
        console.error("Error creating food:", err);
        res.status(500).json({ message: err.message });
    }
};

//PUT for updating food data
const updateFood = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ message: "Food not found!" });
        }

        food.name = name;
        food.description = description;
        food.price = price;
        food.category = category;

        if(req.file) {
            // Delete old image from Cloudinary if it exists
            if (food.image) {
                const publicId = getPublicIdFromUrl(food.image);
                if (publicId) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                    }
                }
            }
            food.image = req.file.path;
        }
        
        const updatedFood = await food.save();

        res.status(200).json(updatedFood);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//DELETE for deleting food data
const deleteFood = async (req, res) => {
    try{
        const food = await Food.findById(req.params.id);

        if(!food){
            return res.status(404).json({ message: "Food not found!" });
        }

        // Delete image from Cloudinary if it exists
        if (food.image) {
            const publicId = getPublicIdFromUrl(food.image);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error("Error deleting image from Cloudinary:", error);
                }
            }
        }

        await Food.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Food deleted successfully." });
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
};

module.exports = { getAllFoods, createFood, updateFood, deleteFood };