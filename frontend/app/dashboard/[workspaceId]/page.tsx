"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Document {
    document_id: number;
    title: string;
}

export default function workspaceDocPage() {
    const workspaceId = useParams();
    const router = useRouter();
    const [ docs, setDocs ] = useState<Document[]>([]);
    const [ newTitle, setNewTitle ] = useState("");

    const loadDocs = async () => {
        const { data } = await api.get(`/api/documents/?workspace=${workspaceId}`);
        setDocs(data);
    };

    useEffect(() => {
        loadDocs();
    }, [workspaceId]);

    const createDoc = async () => {
        const { data } = await api.post(`/api/documents/`, {
            title: newTitle || "Untitled Document",
            workspace: workspaceId,
        });
        router.push(`/doc/${data.document_id}`);
    };

    return(
        <div style={{ padding: "2rem" }}>
            <h2>Documents</h2>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Document Title" />
            <button onClick={createDoc}>Create Document</button>
            <ul>
                {docs.map((doc) => (
                    <li key={doc.document_id}>
                        <a href={`/doc/${doc.document_id}`}>{doc.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
