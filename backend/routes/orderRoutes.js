const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware")
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getDeliveryOrders, deleteOrder } = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/delivery", protect, authorizeRoles("deliveryBoy"), getDeliveryOrders);
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.put("/:id", protect, authorizeRoles("admin", "deliveryBoy"), updateOrderStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOrder);

module.exports = router;