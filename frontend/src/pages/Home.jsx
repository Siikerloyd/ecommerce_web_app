
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export function Home() {
     const { user, logout } = useContext(AuthContext);
const navigate = useNavigate();

    useEffect(() => {
        async function getProducts() {

            const response = await fetch(
                "http://localhost:8080/api/delivery",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const data = await response.json();

            console.log(data);
        }

        getProducts();

    }, []);
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
