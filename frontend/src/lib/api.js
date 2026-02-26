// src/lib/api.js

let csrfToken = null;

export function setCsrfToken(token) {
    csrfToken = token;
}

export function getCsrfToken() {
    return csrfToken;
}

export async function fetchCsrfToken() {
    const res = await fetch("/api/csrf", {
        method: "GET",
        credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "CSRF Token konnte nicht geladen werden");

    setCsrfToken(data.csrfToken);
    return data.csrfToken;
}

export async function apiFetch(url, options = {}) {
    const opts = {
        credentials: "include",
        ...options,
        headers: {
            ...(options.headers || {}),
        },
    };

    // Bei mutating requests CSRF Header setzen
    const method = (opts.method || "GET").toUpperCase();
    const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

    if (needsCsrf) {
        if (!csrfToken) {
            await fetchCsrfToken();
        }
        opts.headers["X-CSRF-Token"] = csrfToken;
    }

    const res = await fetch(url, opts);

    // JSON versuchen zu lesen
    let data = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        data = await res.json();
    }

    if (!res.ok) {
        const msg = data?.error || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data;
}