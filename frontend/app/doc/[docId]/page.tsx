"use client";

import { useParams } from "next/navigation";
import Editor from "@/components/Editor";

export default function DocPage() {
    const { docId } = useParams();
    return (
        <div style={{ padding: "2rem" }}>
            <Editor documentId={docId as string} />
        </div>
    );
}
