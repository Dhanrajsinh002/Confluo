"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { parseApiError } from "@/lib/errors";

export default function RegisterPage() {
    const router = useRouter();
    const [ form, setForm ] = useState({ username: "", email: "", first_name: "", last_name: "", password: "" });
    const [ errors, setErrors ] = useState<Record<string, string>>({});
    const [ formError, setFormError ] = useState("");
    const [ loading, setLoading ] = useState(false);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const local: Record<string, string> = {};
        if (!form.email.trim()) local.email = "Email is required.";
        if (!form.username.trim()) local.username = "Username is required.";
        if (!form.first_name.trim()) local.first_name = "First name is required.";
        if (!form.last_name.trim()) local.last_name = "Last name is required.";
        if (form.password.length < 8) local.password = "Password must be at least 8 characters.";
        setErrors(local);
        if (Object.keys(local).length) return;

        setLoading(true);

        try {
            await api.post("/auth/register/", form);
            router.push("/login");
        } catch(err: any) {
            const { message, fields } = parseApiError(err, "Registration failed.");
            setErrors(fields);
            if (!Object.keys(fields).length) setFormError(message);
        } finally {
            setLoading(false);
        }
    };

    const field = (key: keyof typeof form, placeholder: string, type = "text") => (
        <>
        <input type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} />
        {errors[key] && <small role="alert" style={{ color: "red", display: "block" }}>{errors[key]}</small>}
        <br />
        </>
    );

    return (
    <div style={{ maxWidth: 400, margin: "4rem auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {field("email", "Email")}
        {field("username", "Username")}
        {field("first_name", "First name")}
        {field("last_name", "Last name")}
        {field("password", "Password", "password")}
        {formError && <p role="alert" style={{ color: "red" }}>{formError}</p>}
        <button type="submit" disabled={loading}>{loading ? "Creating account…" : "Register"}</button>
      </form>
    </div>
  );
}
