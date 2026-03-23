const Order = require("../models/Order");

//Create order
const createOrder = async (req, res) => {
    try{
        const { items, address, paymentMethod } = req.body;

        const totalAmount = items.reduce((acc, item) => {
            return acc + item.price * item.quantity;
        }, 0);

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
        const orders = await Order.find().populate("user", "name email").populate("items.food", "name price").populate("deliveryBoy", "name email");

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

        //Only assigned delivery boy can update their order status
        if(req.user.role === "deliveryBoy" && order.deliveryBoy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not your order!" });
        }

        order.status = status;

        if(deliveryBoy){
            order.deliveryBoy = deliveryBoy;
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
        const order = await Order.find({ deliveryBoy: req.user._id }).populate("user", "name email").populate("items.food", "name price");

        res.status(200).json(order);
    }  catch(err){
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getDeliveryOrders };