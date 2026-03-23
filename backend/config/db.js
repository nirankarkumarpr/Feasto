const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch(err){
        console.error(`Connection failed: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;