"use client";

import { useState, useEffect } from "react";
import Login from "./Login";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Upon page refresh, check if we successfully logged in previously
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Decrypting...</div>;

    if (!isAuthenticated) {
        // Throw up the massive Login shield!
        return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    // Access Granted. Render the Dashboard!
    return <>{children}</>;
}
