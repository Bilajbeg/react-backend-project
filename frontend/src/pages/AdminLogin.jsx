import { useState } from "react";
import useCsrf from "../hooks/useCsrf";
import { apiFetch } from "../lib/api";

export default function AdminLogin({ onLoginSuccess }) {
    const { csrfToken, csrfLoading, refreshCsrf } = useCsrf();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        try {
            // falls Token noch nicht da ist:
            if (!csrfToken) await refreshCsrf();

            await apiFetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                body: JSON.stringify({ username, password }),
            });

            await onLoginSuccess?.();
            window.location.href = "/admin";
        } catch (err) {
            // wenn CSRF abgelaufen ist → neuen holen (einmalig)
            if (String(err.message).toLowerCase().includes("csrf")) {
                await refreshCsrf();
            }
            setError(err.message);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl bg-white">
            <h2 className="text-2xl font-bold mb-6">Admin Login</h2>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block mb-1">Username</label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block mb-1">Passwort</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={csrfLoading}
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                >
                    {csrfLoading ? "..." : "Login"}
                </button>

                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </form>
        </div>
    );
}