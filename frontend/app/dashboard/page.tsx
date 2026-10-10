"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { parseApiError } from "@/lib/errors";
import { useRequireAuth } from "@/lib/useRequireAuth";

interface Workspace {
    workspace_id: number;
    name: string;
}

export default function DashboardPage() {
    useRequireAuth();
    const [ workspaces, setWorkspaces ] = useState<Workspace[]>([]);
    const [ newName, setNewName ] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    
    const loadWorkspaces = async () => {
        setError("");
        try {
            const { data } = await api.get("/workspaces/");
            setWorkspaces(data);
        } catch (err) {
            setError(parseApiError(err, "Couldn't load your workspaces.").message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const createWorkspace = async () => {
        setActionError("");
        if (!newName.trim()) { setActionError("Give your workspace a name."); return; }
        try {
            await api.post("/workspaces/", { name: newName });
            setNewName("");
            loadWorkspaces();
        } catch (err) {
            const { message, fields } = parseApiError(err, "Couldn't create the workspace.");
            setActionError(fields.name || message);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
        <h2>Your Workspaces</h2>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New workspace name" />
        <button onClick={createWorkspace}>Create</button>
        {actionError && <p role="alert" style={{ color: "red" }}>{actionError}</p>}

        {loading && <p>Loading…</p>}
        {error && (
            <p role="alert" style={{ color: "red" }}>
            {error} <button onClick={loadWorkspaces}>Retry</button>
            </p>
        )}
        {!loading && !error && workspaces.length === 0 && (
            <p>No workspaces yet. Create your first one above.</p>
        )}
        <ul>
            {workspaces.map((ws) => (
            <li key={ws.workspace_id}>
                <Link href={`/dashboard/${ws.workspace_id}`}>{ws.name}</Link>
            </li>
            ))}
        </ul>
        </div>
    );
}
