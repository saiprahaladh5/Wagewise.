"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => console.log("SW registered scope: ", registration.scope))
                .catch((err) => console.error("SW registration failed: ", err));
        }
    }, []);
    return null;
}
