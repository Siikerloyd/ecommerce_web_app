
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute() {
    const { user, isLoading } = useContext(AuthContext);
    const location = useLocation();

    if (isLoading) {
        return <p>Checking your session...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export default ProtectedRoute;