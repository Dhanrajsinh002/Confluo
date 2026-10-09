"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Workspace {
    workspace_id: number;
    name: string;
}

export default function DashboardPage() {
    const [ workspaces, setWorkspaces ] = useState<Workspace[]>([]);
    const [ newName, setNewName ] = useState("");
    
    const loadWorkspace = async () => {
        const { data } = await api.get("/api/workspaces/");
        setWorkspaces(data);
    };

    useEffect(() => {
        loadWorkspace();
    }, []);

    const createWorkspace = async () => {
        if (!newName.trim()) return;
        await api.post("/api/workspaces/", { name: newName });
        setNewName("");
        loadWorkspace();
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Your Workspaces</h2>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name workspace name"/>
            <button onClick={createWorkspace}>Create Workspace</button>
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
