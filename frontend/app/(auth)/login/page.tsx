"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import { parseApiError } from "@/lib/errors";

export default function LoginPage() {
    const router = useRouter();
    const [ form, setForm ] = useState({ email: "", password: "" });
    const [ error, setError ] = useState("");
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("expired")) {
            setError("Your session expired. Please login again.");
        }
    },[]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setError("");
        if (!form.email.trim() || !form.password) {
            setError("Enter your email and password.");
            return;
        }
        setLoading(true);

        try {
            const { data } = await api.post("/auth/login/", form);
            saveTokens(data.access, data.refresh);
            router.push("/dashboard");
        } catch(err: any) {
            setError(
                axios.isAxiosError(err) && err.response?.status === 401
                ? "Incorrect Emial or Password"
                : parseApiError(err).message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "4rem auto" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input type="password" placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
                { error && <p style={{ color: "red" }}>{error}</p> }
                <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            </form>
        </div>
    );
}
