import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export function Home() {

    const { user, token } = useContext(AuthContext);

    useEffect(() => {
        async function getProducts() {

            const response = await fetch(
                "http://localhost:8080/api/delivery",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();

        console.log(data);

        }

        getProducts();

    }, []);

   

    return (
        <h1>Welcome to Home</h1>
    );
}

export default Home;