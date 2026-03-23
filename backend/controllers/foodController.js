const Food = require("../models/Food.js");

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
    const {name, description, price, category, image} = req.body;

    try {
        const food = await Food.create({
            name,
            description,
            price,
            category,
            image,
        });
        res.status(201).json(food);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//DELETE for deleting food data
const deleteFood = async (req, res) => {
    try{
        const food = await Food.findByIdAndDelete(req.params.id);

        if(!food){
            return res.status(404).json({ message: "Food not found!" });
        }

        res.status(200).json({ message: "Food deleted successfully." });
    } catch(err) {
        res.status(500).json({ message: err.message })
    }
};

module.exports = { getAllFoods, createFood, deleteFood };