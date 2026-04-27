const Order = require("../models/Order");

//Create order
const createOrder = async (req, res) => {
    try{
        const { items, paymentMethod, totalAmount, deliveryAddress, customerName, mobile } = req.body;

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
            paymentMethod,
            deliveryAddress,
            customerName,
            mobile,
        });

        // Populate order details for socket emission
        const populatedOrder = await Order.findById(order._id)
            .populate("user", "name email")
            .populate("items.food", "name price image");

        // Socket.io - Notify admin about new order
        const io = req.app.get("io");
        io.to("admin").emit("newOrder", populatedOrder);

        res.status(201).json(order);
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
};

//Get user orders
const getMyOrders = async(req, res) => {
    try{
        const orders = await Order.find({ user: req.user._id })
            .populate("items.food", "name price image")
            .populate("deliveryBoy", "name email");

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

        let userCancelled = false;

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
            userCancelled = true;
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

        // Populate order for socket emission
        const populatedOrder = await Order.findById(order._id)
            .populate("user", "name email")
            .populate("items.food", "name price image")
            .populate("deliveryBoy", "name email");

        // Socket.io - Notify all relevant parties about order update
        const io = req.app.get("io");
        
        if (userCancelled) {
            io.to("admin").emit("orderCancelledByUser", populatedOrder);
        }
        
        io.to("admin").emit("orderUpdated", populatedOrder);
        io.to("deliveryBoy").emit("orderUpdated", populatedOrder);

        // Emit to specific user who placed the order
        io.to(`user-${order.user}`).emit("orderUpdated", populatedOrder);

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

        const orderId = order._id;

        await Order.findByIdAndDelete(req.params.id);

        // Socket.io - Notify all parties about order deletion
        const io = req.app.get("io");
        io.to("admin").emit("orderDeleted", orderId);
        io.to("deliveryBoy").emit("orderDeleted", orderId);
        
        // Emit to specific user who placed the order
        io.to(`user-${order.user}`).emit("orderDeleted", orderId);

        res.status(200).json({ message: "Order deleted successfully!" });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

//Get single order by ID
const getOrderById = async(req, res) => {
    try{
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("items.food", "name price image")
            .populate("deliveryBoy", "name email");

        if(!order) {
            return res.status(404).json({ message: "Order not found!" });
        }

        // Check if user has permission to view this order
        const isOwner = order.user._id.toString() === req.user._id.toString();
        const isDeliveryBoy = order.deliveryBoy && order.deliveryBoy._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if(!isOwner && !isDeliveryBoy && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to view this order!" });
        }

        res.status(200).json({ order });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

//Update delivery location - for Delivery Boy
const updateDeliveryLocation = async(req, res) => {
    try{
        const { lat, lng } = req.body;

        // Validate coordinates
        if(typeof lat !== 'number' || typeof lng !== 'number') {
            return res.status(400).json({ message: "Invalid coordinates format" });
        }

        if(lat < -90 || lat > 90) {
            return res.status(400).json({ message: "Latitude must be between -90 and 90" });
        }

        if(lng < -180 || lng > 180) {
            return res.status(400).json({ message: "Longitude must be between -180 and 180" });
        }

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({ message: "Order not found!" });
        }

        // Only assigned delivery boy can update location
        if(!order.deliveryBoy || order.deliveryBoy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this order location!" });
        }

        // Update delivery location
        order.deliveryLocation = {
            lat,
            lng,
            timestamp: new Date()
        };

        await order.save();

        // Populate order for socket emission
        const populatedOrder = await Order.findById(order._id)
            .populate("user", "name email")
            .populate("items.food", "name price image")
            .populate("deliveryBoy", "name email");

        // Socket.io - Notify customer and admin about location update
        const io = req.app.get("io");
        
        io.to(`order-${order._id}`).emit("deliveryLocationUpdated", {
            orderId: order._id,
            location: order.deliveryLocation,
            deliveryBoy: populatedOrder.deliveryBoy
        });
        io.to("admin").emit("deliveryLocationUpdated", {
            orderId: order._id,
            location: order.deliveryLocation,
            deliveryBoy: populatedOrder.deliveryBoy
        });

        res.status(200).json({
            success: true,
            order: populatedOrder
        });
    } catch(err){
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getDeliveryOrders, deleteOrder, updateDeliveryLocation, getOrderById };