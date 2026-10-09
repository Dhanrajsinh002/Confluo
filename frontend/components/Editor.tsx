"use client";

import { useRef, useState, useEffect } from "react";
import { createYjsConnection } from "@/lib/yjsProvider";
import PresenceBar from "./PresenceBar";

interface Props {
    documentId: string;
}

export default function Editor({ documentId }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [ status, setStatus ] = useState("connecting");
    const [ presenceCount, setPresenceCount ] = useState(1);

    useEffect(() => {
        const { ydoc, provider, ytext } = createYjsConnection(documentId);

        provider.on('status', (event: { status: string }) => {
            setStatus(event.status);
        });

        provider.awareness.on('change', () => {
            setPresenceCount(provider.awareness.getStates().size);
        });

        const textarea = textareaRef.current!;
        textarea.value = ytext.toString();

        const updateFromYjs = () => {
            ydoc.transact(() => {
                ytext.delete(0, ytext.length);
                ytext.insert(0, textarea.value);
            });
        };
        ytext.observe(updateFromYjs);

        const updateFromTextarea = () => {
            ydoc.transact(() => {
                ytext.delete(0, ytext.length);
                ytext.insert(0, textarea.value);
            });
        };
        textarea.addEventListener('input', updateFromTextarea);

        return () => {
            textarea.removeEventListener('input', updateFromTextarea);
            ytext.unobserve(updateFromYjs);
            provider.destroy();
            ydoc.destroy();
        };
    },[documentId]);

    return (
        <div>
            <PresenceBar count={presenceCount} />
            <p>Status: {status}</p>
            <textarea
                ref={textareaRef}
                rows={25}
                cols={80}
                style={{ fontSize: "16px", padding: "1rem", width: "100%" }}
            />
        </div>
    );
}
