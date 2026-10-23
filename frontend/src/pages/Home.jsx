
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function Home() {
    const { logout, apiFetch } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        async function getProducts() {
            try {
                const response = await apiFetch(
                    "http://localhost:8080/api/delivery",
                    { method: "GET" }
                );

                if (!response.ok) {
                    if (response.status !== 401) {
                        console.error(
                            "Failed to fetch products:",
                            response.status
                        );
                    }
                    return;
                }

                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        }

        getProducts();
    }, [apiFetch]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch {
            // Keep the user on the page if logout failed.
        }
    };

    return (
        <>
            <h1>Welcome to Home</h1>
            <button onClick={handleLogout}>
                Logout
            </button>
        </>
    );
}

export default Home;
