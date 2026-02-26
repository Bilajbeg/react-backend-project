// frontend/src/hooks/useCsrf.js
import { useEffect, useState } from "react";
import { fetchCsrfToken, getCsrfToken } from "../lib/api";

export default function useCsrf(active = true) {
    const [csrfToken, setCsrfTokenState] = useState(getCsrfToken() || "");
    const [csrfLoading, setCsrfLoading] = useState(active);

    async function refreshCsrf() {
        setCsrfLoading(true);
        try {
            const t = await fetchCsrfToken();
            setCsrfTokenState(t || "");
            return t;
        } finally {
            setCsrfLoading(false);
        }
    }

    useEffect(() => {
        if (!active) return;
        // falls schon gesetzt, nicht zwingend neu laden
        if (getCsrfToken()) {
            setCsrfTokenState(getCsrfToken());
            setCsrfLoading(false);
            return;
        }
        refreshCsrf();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    return { csrfToken, csrfLoading, refreshCsrf };
}