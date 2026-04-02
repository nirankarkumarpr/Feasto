import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FiChevronRight, FiX } from "react-icons/fi";

const IN_PROGRESS_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
];

function formatINR(amount) {
  const n = Number(amount ?? 0);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(n);
}

function formatOrderDate(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOrderStatusUI(status) {
  if (status === "delivered") {
    return {
      label: "Delivered",
      badge: "bg-green-50 text-green-700",
      dot: "bg-green-500",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Cancelled",
      badge: "bg-red-50 text-red-700",
      dot: "bg-red-500",
    };
  }

  return {
    label: "In progress",
    badge: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  };
}

function displayOrderId(order) {
  // No custom orderId exists in backend model; derive something readable.
  const id = order?._id ?? order?.id ?? "";
  if (!id) return "—";
  return id.toString().slice(-10).toUpperCase();
}

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/orders/my");
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        toast.error("Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (selectedTab === "All") return orders;

    if (selectedTab === "In Progress") {
      return orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status));
    }

    if (selectedTab === "Delivered") {
      return orders.filter((o) => o.status === "delivered");
    }

    if (selectedTab === "Cancelled") {
      return orders.filter((o) => o.status === "cancelled");
    }

    return orders;
  }, [orders, selectedTab]);

  const tabs = ["All", "In Progress", "Delivered", "Cancelled"];

  return (
    <section className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              My Orders
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Track your food delivery status.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "border-orange-500 bg-white text-orange-600"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gray-100" />
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                      <div className="h-3 w-full bg-gray-100 rounded mb-2" />
                      <div className="h-3 w-56 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-700 font-semibold">
                No orders found.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try changing the filter.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const itemCount = order?.items?.length ?? 0;
              const firstFood = order?.items?.[0]?.food;
              const extraCount = Math.max(0, itemCount - 1);

              const statusUI = getOrderStatusUI(order?.status);
              const orderDate = formatOrderDate(order?.createdAt);
              const displayId = displayOrderId(order);

              const firstItemName = firstFood?.name ?? "Food item";
              const itemSummary =
                extraCount > 0
                  ? `${firstItemName} | ${extraCount} more items`
                  : firstItemName;

              return (
                <div
                  key={order._id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {firstFood?.image ? (
                        <img
                          src={firstFood.image}
                          alt={firstFood.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-orange-300">
                          {firstItemName.charAt(0)}
                        </div>
                      )}

                      {extraCount > 0 && (
                        <span className="absolute bottom-1 right-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-700">
                          +{extraCount}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusUI.badge}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${statusUI.dot}`}
                          />
                          {statusUI.label}
                        </span>
                        {orderDate && (
                          <span className="text-sm text-gray-400">
                            | {orderDate}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm font-bold text-gray-900">
                        Order ID: {displayId}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {itemSummary}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        ₹{formatINR(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-50 transition"
                    aria-label="View order details"
                  >
                    <FiChevronRight className="text-xl text-orange-600" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Order ID: {displayOrderId(selectedOrder)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX className="text-xl text-gray-700" />
              </button>
            </div>

            <div className="px-5 py-4">
              {(() => {
                const statusUI = getOrderStatusUI(selectedOrder?.status);
                return (
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusUI.badge}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${statusUI.dot}`}
                      />
                      {statusUI.label}
                    </span>

                    <span className="text-sm text-gray-500">
                      {formatOrderDate(selectedOrder?.createdAt) || ""}
                    </span>
                  </div>
                );
              })()}

              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Address:</span>{" "}
                  {selectedOrder?.address}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Payment:</span>{" "}
                  {selectedOrder?.paymentMethod}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Total:</span> ₹
                  {formatINR(selectedOrder?.totalAmount)}
                </p>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-900">
                  Items
                </h3>
                <div className="mt-3 space-y-3">
                  {(selectedOrder?.items ?? []).map((it, idx) => (
                    <div
                      key={it.food?._id ?? idx}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {it.food?.name ?? "Food"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {it.quantity} x ₹{formatINR(it.price)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        ₹{formatINR(it.price * it.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Order;