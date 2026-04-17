const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
});

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
        default: "pending",
    },
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        default: "cod",
    },
    paymentId: {
        type: String,
        default: null,
    },
},
{
    timestamps: true,
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;