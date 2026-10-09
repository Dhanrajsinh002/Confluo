"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { saveTokens } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [ form, setForm ] = useState({ email: "", password: "" });
    const [ error, setError ] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post("/auth/login/", form);
            saveTokens(data.access, data.refresh);
            router.push("/dashboard");
        } catch(err: any) {
            setError("Invalid Credentials.");
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
