const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getPendingAdmins, getAllAdmins, approveAdmin, rejectAdmin, deleteAdmin } = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/pending-admins", protect, authorizeRoles("admin"), getPendingAdmins);
router.get("/all-admins", protect, authorizeRoles("admin"), getAllAdmins);
router.put("/approve-admin/:id", protect, authorizeRoles("admin"), approveAdmin);
router.delete("/reject-admin/:id", protect, authorizeRoles("admin"), rejectAdmin);
router.delete("/delete-admin/:id", protect, authorizeRoles("admin"), deleteAdmin);

module.exports = router;