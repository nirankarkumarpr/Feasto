const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware")
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getDeliveryOrders, deleteOrder, updateDeliveryLocation, getOrderById } = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/delivery", protect, authorizeRoles("deliveryBoy"), getDeliveryOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.put("/:id", protect, authorizeRoles("admin", "deliveryBoy", "user"), updateOrderStatus);
router.put("/:id/delivery-location", protect, authorizeRoles("deliveryBoy"), updateDeliveryLocation);
router.delete("/:id", protect, authorizeRoles("admin"), deleteOrder);

module.exports = router;