"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [ form, setForm ] = useState({ username: "", email: "", password: "" });
    const [ error, setError ] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/auth/register/", form);
            router.push("/login");
        } catch(err: any) {
            setError(err.response?.data?.email?.[0] || "Registration Failed.");
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "4rem auto" }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}/><br/>
                <input placeholder="Username" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}/><br/>
                <input type="password" placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}/><br/>
                {error && <p style={{ color: "Red" }}>{ error }</p>}
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
