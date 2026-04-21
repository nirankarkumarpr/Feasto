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
    customerName: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    deliveryAddress: {
        street: String,
        city: String,
        postalCode: String,
        houseNo: String,
        landmark: String,
        mapAddress: String,
        coordinates: {
            lat: {
                type: Number,
                min: -90,
                max: 90,
            },
            lng: {
                type: Number,
                min: -180,
                max: 180,
            }
        }
    },
    deliveryLocation: {
        lat: {
            type: Number,
            min: -90,
            max: 90,
        },
        lng: {
            type: Number,
            min: -180,
            max: 180,
        },
        timestamp: Date,
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

orderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;