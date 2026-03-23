import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";

function ProtectedRoute({ children, roles }) {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            toast.error("Please login first!");
        } else if (roles && !roles.includes(user.role)) {
            toast.error("Your are not authorized!");
        }
    }, []);

    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

    return children;
}

export default ProtectedRoute;