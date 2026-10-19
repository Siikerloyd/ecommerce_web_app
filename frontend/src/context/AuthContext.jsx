
import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8080/api/me", {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                setUser(null);
                return;
            }

            const data = await response.json();
            setUser(data.result);
        } catch (error) {
            console.error("Failed to check session:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);
    const logout = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/logout", {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    };


    return (
        <AuthContext.Provider
            value={{ user, setUser, isLoading, checkSession,logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
