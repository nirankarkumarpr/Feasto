const Order = require("../models/Order");

//Create order
const createOrder = async (req, res) => {
    try{
        const { items, address, paymentMethod, totalAmount } = req.body;

        const deliveryFee = 40;
        const calculatedTotal = items.reduce((acc, item) => {
            return acc + item.price * item.quantity;
        }, 0);
        if (totalAmount < calculatedTotal + deliveryFee) {
            return res.status(400).json({ message: "Invalid total amount" });
        }

        const order = await Order.create({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentMethod,
        });

        res.status(201).json(order);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

//Get user orders
const getMyOrders = async(req, res) => {
    try{
        const orders = await Order.find({ user: req.user._id }).populate("items.food", "name price image");

        res.status(200).json(orders);
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

//Get all orders - for Admin
const getAllOrders = async(req, res) => {
    try{
        const orders = await Order.find().populate("user", "name email").populate("items.food", "name price image").populate("deliveryBoy", "name email");

        res.status(200).json(orders);
    } catch(err){
        res.status(500).json({ message: err.message });
    }
}

//Update order status
const updateOrderStatus = async(req, res) => {
    try{
        const { status, deliveryBoy } = req.body;

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({ message: "Order not found!"});
        }

        // Allow customers to cancel their orders (only if pending, confirmed, or preparing)
        if(req.user.role === "user") {
            if(order.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Not authorized to update this order!" });
            }
            if(status !== "cancelled") {
                return res.status(403).json({ message: "Customers can only cancel orders!" });
            }
            if(!["pending", "confirmed", "preparing"].includes(order.status)) {
                return res.status(400).json({ message: "Cannot cancel order at this stage!" });
            }
            order.status = status;
        }

        // If delivery boy is accepting an order (no deliveryBoy assigned yet)
        else if(req.user.role === "deliveryBoy" && !order.deliveryBoy && deliveryBoy) {
            order.deliveryBoy = deliveryBoy;
            order.status = status;
        }

        // If delivery boy is updating their own order
        else if(req.user.role === "deliveryBoy" && order.deliveryBoy && order.deliveryBoy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not your order!" });
        }
        
        // Admin or delivery boy updating their own order
        else {
            order.status = status;
            if(deliveryBoy){
                order.deliveryBoy = deliveryBoy;
            }
        }

        await order.save();

        res.status(200).json(order);
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

//Get delivery orders
const getDeliveryOrders = async(req, res) => {
    try{
        const orders = await Order.find({
            $or: [
                { deliveryBoy: req.user._id },
                { status: "preparing", deliveryBoy: null }
            ]
        })
        .populate("user", "name email")
        .populate("items.food", "name price image")
        .populate("deliveryBoy", "name email")
        .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

//Delete order - for Admin
const deleteOrder = async(req, res) => {
    try{
        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({ message: "Order not found!" });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Order deleted successfully!" });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getDeliveryOrders, deleteOrder };