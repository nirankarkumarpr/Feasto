const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db.js");
const dotenv = require("dotenv");

dotenv.config();

// Debug: Check if environment variables are loaded
console.log("Environment variables loaded:");
console.log("MONGO_URL:", process.env.MONGO_URL ? "✓ Set" : "✗ Missing");
console.log("JWT_SECRETKEY:", process.env.JWT_SECRETKEY ? "✓ Set" : "✗ Missing");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL ? "✓ Set" : "✗ Missing");

connectDB();

const foodRoutes = require("./routes/foodRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL 
].filter(Boolean);

const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.io connection handler
io.on("connection", (socket) => {
    // User joins a room based on their role
    socket.on("join", (role) => {
        socket.join(role);
    });

    // Join user-specific room
    socket.on("joinUserRoom", (userId) => {
        socket.join(`user-${userId}`);
    });

    // Join order-specific room for tracking
    socket.on("joinOrderRoom", (orderId) => {
        socket.join(`order-${orderId}`);
    });

    // Leave order-specific room
    socket.on("leaveOrderRoom", (orderId) => {
        socket.leave(`order-${orderId}`);
    });

    socket.on("disconnect", () => {
        // Client disconnected
    });
});


app.set("io", io);

// CORS middleware - allows requests from allowed origins
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Feasto App is running..."});
});

app.use("/api/foods", foodRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});