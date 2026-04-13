const express = require("express");
const router = express.Router();
const { getAllFoods, createFood, updateFood, deleteFood } = require("../controllers/foodController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware");

router.get("/", getAllFoods);
router.post("/", protect, authorizeRoles("admin"), upload.single("image"), createFood);
router.put("/:id", protect, authorizeRoles("admin"), upload.single("image"), updateFood);
router.delete("/:id", protect, authorizeRoles("admin"), deleteFood);

module.exports = router;