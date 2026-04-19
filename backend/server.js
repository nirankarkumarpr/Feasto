const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db.js");
const dotenv = require("dotenv");

dotenv.config();
connectDB();

const foodRoutes = require("./routes/foodRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.io connection handler
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // User joins a room based on their role
    socket.on("join", (role) => {
        socket.join(role);
        console.log(`User joined ${role} room`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});


app.set("io", io);

app.use(cors());
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