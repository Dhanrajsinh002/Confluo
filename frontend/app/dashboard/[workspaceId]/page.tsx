"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { parseApiError } from "@/lib/errors";
import { useRequireAuth } from "@/lib/useRequireAuth";

interface Document { document_id: number; title: string; }

export default function WorkspaceDocPage() {
  useRequireAuth();
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = Array.isArray(params.workspaceId) ? params.workspaceId[0] : params.workspaceId;

  const [docs, setDocs] = useState<Document[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadDocs = async () => {
    setError("");
    try {
      const { data } = await api.get("/documents/", { params: { workspace: workspaceId } });
      setDocs(data);
    } catch (err) {
      setError(parseApiError(err, "Couldn't load documents.").message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, [workspaceId]);

  const createDoc = async () => {
    setActionError("");
    try {
      const { data } = await api.post("/documents/", {
        title: newTitle || "Untitled Document",
        workspace: workspaceId,
      });
      router.push(`/doc/${data.document_id}`);
    } catch (err) {
      const { message, fields } = parseApiError(err, "Couldn't create the document.");
      setActionError(fields.workspace || fields.title || message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Documents</h2>
      <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Document title" />
      <button onClick={createDoc}>Create Document</button>
      {actionError && <p role="alert" style={{ color: "red" }}>{actionError}</p>}

      {loading && <p>Loading…</p>}
      {error && <p role="alert" style={{ color: "red" }}>{error} <button onClick={loadDocs}>Retry</button></p>}
      {!loading && !error && docs.length === 0 && <p>No documents yet.</p>}
      <ul>
        {docs.map((doc) => (
          <li key={doc.document_id}><a href={`/doc/${doc.document_id}`}>{doc.title}</a></li>
        ))}
      </ul>
    </div>
  );
}