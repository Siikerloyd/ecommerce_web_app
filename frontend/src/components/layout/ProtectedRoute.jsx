
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function ProtectedRoute() {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <p>Checking your session...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;