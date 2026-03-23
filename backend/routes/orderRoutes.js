const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware")
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getDeliveryOrders } = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/delivery", protect, authorizeRoles("deliveryBoy"), getDeliveryOrders);
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.put("/:id", protect, authorizeRoles("admin", "deliveryBoy"), updateOrderStatus);

module.exports = router;