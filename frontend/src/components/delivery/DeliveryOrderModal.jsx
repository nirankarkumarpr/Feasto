import { MdClose } from "react-icons/md";
import { StatusButton, formatDate, formatPaymentMethod } from "../../utils/orderUtils.jsx";

function DeliveryOrderModal({ order, setSelectedOrder }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={() => setSelectedOrder(null)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
              <p className="text-sm text-gray-400">Order ID: {order._id.slice(-8).toUpperCase()}</p>
            </div>

            <button
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
              onClick={() => setSelectedOrder(null)}
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <div className="border-t opacity-30 mb-4" />

          <div className="flex items-center gap-3 mb-4">
            <StatusButton order={order} />
            <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Customer: </span>{order.user?.name || "N/A"}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Delivery Address: </span>
              <span className="font-medium text-orange-600">{order.address}</span>
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Payment: </span>{formatPaymentMethod(order.paymentMethod)}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Total Amount: </span>
              <span className="text-orange-500 font-bold">₹{order.totalAmount}</span>
            </p>
          </div>

          <div className="border-t opacity-10" />
        </div>

        <div className="px-6 pb-6 overflow-y-auto">
          <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  {item.food?.image ? (
                    <img
                      src={item.food.image}
                      alt={item.food.name}
                      className="w-full h-full object-cover scale-125"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                      {item.food?.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{item.food?.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} x ₹{item.price}</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{item.quantity * item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryOrderModal;
