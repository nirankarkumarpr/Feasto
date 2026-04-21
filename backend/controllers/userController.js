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

        const user = await User.create({ name, mobile, password, role });

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

module.exports = { registerUser, loginUser };

