const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRETKEY,
        { expiresIn: "7d" },
    );
};

const registerUser = async (req, res) => {
    try{
        const { name, mobile, password, role } = req.body;

        const userExists = await User.findOne({ mobile });

        if(userExists) {
            return res.status(400).json({ message: "User already exists!"});
        }

        // Check if this is an admin registration
        let isApproved = true;
        if(role === "admin") {
            const adminExists = await User.findOne({ role: "admin", isApproved: true });
            
            if(adminExists) {
                isApproved = false;
            }
        }

        const user = await User.create({ name, mobile, password, role, isApproved });

        // If admin needs approval, notify existing admins via socket
        if(role === "admin" && !isApproved) {
            const io = req.app.get("io");
            io.to("admin").emit("newAdminRequest", {
                _id: user._id,
                name: user.name,
                mobile: user.mobile,
                createdAt: user.createdAt,
            });

            return res.status(201).json({
                message: "Waiting for approval from existing admin.",
                pendingApproval: true,
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

const loginUser = async (req, res) => {
    try{
        const { mobile, password } = req.body;

        const user = await User.findOne({ mobile });

        if(!user){
            return res.status(401).json({ message: "Invalid mobile number or password!" });
        }

        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            return res.status(401).json({ message: "Invalid mobile number or password!" });
        }

        // Check if admin account is approved
        if(user.role === "admin" && !user.isApproved) {
            return res.status(403).json({ message: "Please wait for existing admin to approve your account." });
        }

        res.status(200).json({
                _id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
                token: generateToken(user._id),
        });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

// Get pending admin requests
const getPendingAdmins = async (req, res) => {
    try {
        const pendingAdmins = await User.find({ 
            role: "admin", 
            isApproved: false 
        }).select("-password").sort({ createdAt: -1 });

        res.status(200).json(pendingAdmins);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all admins (both pending and approved)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ 
            role: "admin"
        }).select("-password").populate("approvedBy", "name").sort({ createdAt: -1 });

        res.status(200).json(admins);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

// Approve admin request
const approveAdmin = async (req, res) => {
    try {
        const adminToApprove = await User.findById(req.params.id);

        if(!adminToApprove) {
            return res.status(404).json({ message: "Admin request not found!" });
        }

        if(adminToApprove.role !== "admin") {
            return res.status(400).json({ message: "User is not an admin!" });
        }

        if(adminToApprove.isApproved) {
            return res.status(400).json({ message: "Admin already approved!" });
        }

        adminToApprove.isApproved = true;
        adminToApprove.approvedBy = req.user._id;
        await adminToApprove.save();

        // Notify all admins about the approval
        const io = req.app.get("io");
        io.to("admin").emit("adminApproved", {
            _id: adminToApprove._id,
            name: adminToApprove.name,
            approvedBy: req.user.name,
        });

        res.status(200).json({ 
            message: "Admin approved successfully!",
            admin: {
                _id: adminToApprove._id,
                name: adminToApprove.name,
                mobile: adminToApprove.mobile,
            }
        });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

// Reject admin request
const rejectAdmin = async (req, res) => {
    try {
        const adminToReject = await User.findById(req.params.id);

        if(!adminToReject) {
            return res.status(404).json({ message: "Admin request not found!" });
        }

        if(adminToReject.role !== "admin") {
            return res.status(400).json({ message: "User is not an admin!" });
        }

        if(adminToReject.isApproved) {
            return res.status(400).json({ message: "Cannot reject approved admin!" });
        }

        await User.findByIdAndDelete(req.params.id);

        // Notify all admins about the rejection
        const io = req.app.get("io");
        io.to("admin").emit("adminRejected", {
            _id: adminToReject._id,
            name: adminToReject.name,
        });

        res.status(200).json({ message: "Admin request rejected successfully!" });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete admin account (for approved admins)
const deleteAdmin = async (req, res) => {
    try {
        const adminToDelete = await User.findById(req.params.id);

        if(!adminToDelete) {
            return res.status(404).json({ message: "Admin not found!" });
        }

        if(adminToDelete.role !== "admin") {
            return res.status(400).json({ message: "User is not an admin!" });
        }

        // Prevent deleting yourself
        if(adminToDelete._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own account!" });
        }

        await User.findByIdAndDelete(req.params.id);

        // Notify all admins about the deletion
        const io = req.app.get("io");
        io.to("admin").emit("adminDeleted", {
            _id: adminToDelete._id,
            name: adminToDelete.name,
        });

        res.status(200).json({ message: "Admin account deleted successfully!" });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { registerUser, loginUser, getPendingAdmins, getAllAdmins, approveAdmin, rejectAdmin, deleteAdmin };

