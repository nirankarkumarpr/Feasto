const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed!" });
    }

    const order = await Order.create({
      ...orderData,
      user: req.user._id,
      paymentMethod: "online",
      paymentId: razorpay_payment_id,
    });

    // Populate order details for socket emission
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.food", "name price image");

    // Socket.io - Notify admin about new order
    const io = req.app.get("io");
    io.to("admin").emit("newOrder", populatedOrder);

    res.status(201).json({
      message: "Payment successful.",
      order,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };