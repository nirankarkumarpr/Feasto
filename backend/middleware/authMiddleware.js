const jwt = require("jsonwebtoken");
const User = require("../models/User");

//Checks whether user is looged in or not
const protect = async(req, res, next) => {
    try{
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            return res.status(401).json({ message: "Not authorized, no token!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRETKEY); 

        req.user = await User.findById(decoded.id).select("-password");

        // Check if user is approved (for admin role)
        if(req.user.role === "admin" && !req.user.isApproved) {
            return res.status(403).json({ message: "Admin account pending approval!" });
        }

        next();
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

//Check for the specific role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({ message: `${req.user.role} is not authorized!` });
        }

        next();
    };
};

module.exports = { protect, authorizeRoles };