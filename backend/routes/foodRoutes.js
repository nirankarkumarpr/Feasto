const express = require("express");
const router = express.Router();
const { getAllFoods, createFood, deleteFood } = require("../controllers/foodController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

router.get("/", getAllFoods);
router.post("/", protect, authorizeRoles("admin"), createFood);
router.delete("/:id", protect, authorizeRoles("admin"), deleteFood);

module.exports = router;