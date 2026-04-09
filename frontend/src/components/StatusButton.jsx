function StatusButton({ order }) {
    const getStatusStyle = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-600",
            confirmed: "bg-blue-100 text-blue-600",
            preparing: "bg-purple-100 text-purple-600",
            out_for_delivery: "bg-orange-100 text-orange-600",
            delivered: "bg-green-100 text-green-600",
            cancelled: "bg-red-100 text-red-600",
        };
        return styles[status] || "bg-gray-100 text-gray-600";
    };

    const getStatusDot = (status) => {
        const colors = {
            pending: "bg-yellow-500",
            confirmed: "bg-blue-500",
            preparing: "bg-purple-500",
            out_for_delivery: "bg-orange-500",
            delivered: "bg-green-500",
            cancelled: "bg-red-500",
        };
        return colors[status] || "bg-gray-500";
    };

    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusStyle(order.status)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`}/>
            {order.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
        </span>
    )
};

export default StatusButton;