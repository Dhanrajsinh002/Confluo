"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { createYjsConnection } from "@/lib/yjsProvider";
import { getAccessToken } from "@/lib/auth";
import PresenceBar from "./PresenceBar";

interface Props {
    documentId: string;
}

const LOCAL_ORIGIN = "local-input";
const WS_UNAUTHORIZED = 4401;
const WS_UNSUPPORTED_DATA = 1003;

export default function Editor({ documentId }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [status, setStatus] = useState("connecting");
    const [presenceCount, setPresenceCount] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [authFailed, setAuthFailed] = useState(false);

    useEffect(() => {
        if (!getAccessToken()) {
            setAuthFailed(true);
            setError("You need to log in to edit this document.");
            return;
        }

        const { ydoc, provider, ytext } = createYjsConnection(documentId);
        const textarea = textareaRef.current!;

        const onStatus = (event: { status: string }) => {
            setStatus(event.status);
            if (event.status === "connected") setError(null);
        };
        const onClose = (event: CloseEvent | null) => {
            if (event?.code === WS_UNAUTHORIZED) {
                setAuthFailed(true);
                setError(event.reason
                    ? `${event.reason}. Please log in again.`
                    : "Your session has expired. Please log in again.");
                provider.shouldConnect = false; // stop retrying with a bad token
                provider.disconnect();
            } else if (event?.code === WS_UNSUPPORTED_DATA) {
                setError("The server rejected the data sent. Please refresh the page.");
            }
        };
        const onConnectionError = () => setError("Can't reach the realtime server. Retrying…");
        const onAwareness = () => setPresenceCount(provider.awareness.getStates().size);

        provider.on("status", onStatus);
        provider.on("connection-close", onClose);
        provider.on("connection-error", onConnectionError);
        provider.awareness.on("change", onAwareness);
        onAwareness();

        textarea.value = ytext.toString();

        const updateFromYjs = (_event: unknown, transaction: { origin: unknown }) => {
            if (transaction.origin === LOCAL_ORIGIN) return;
            const pos = textarea.selectionStart;
            textarea.value = ytext.toString();
            textarea.setSelectionRange(pos, pos);
        };
        ytext.observe(updateFromYjs);

        const updateFromTextarea = () => {
            const newVal = textarea.value;
            const oldVal = ytext.toString();

            let start = 0;
            while (start < oldVal.length && start < newVal.length && oldVal[start] === newVal[start]) start++;

            let endOld = oldVal.length;
            let endNew = newVal.length;
            while (endOld > start && endNew > start && oldVal[endOld - 1] === newVal[endNew - 1]) {
                endOld--;
                endNew--;
            }

            ydoc.transact(() => {
                if (endOld > start) ytext.delete(start, endOld - start);
                if (endNew > start) ytext.insert(start, newVal.slice(start, endNew));
            }, LOCAL_ORIGIN);
        };
        textarea.addEventListener("input", updateFromTextarea);

        return () => {
            textarea.removeEventListener("input", updateFromTextarea);
            ytext.unobserve(updateFromYjs);
            provider.awareness.off("change", onAwareness);
            provider.off("status", onStatus);
            provider.off("connection-close", onClose);
            provider.off("connection-error", onConnectionError);
            provider.destroy();
            ydoc.destroy();
        };
    }, [documentId]);

    return (
        <div>
            <PresenceBar count={presenceCount} />
            {error && (
                <div role="alert" style={{ background: "#fdecea", color: "#b71c1c", padding: "0.5rem 1rem", borderRadius: 4, marginBottom: "1rem" }}>
                    {error} {authFailed && <Link href="/login?expired=1">Log in</Link>}
                </div>
            )}
            <p>Status: {status}</p>
            <textarea
                ref={textareaRef}
                rows={25}
                cols={80}
                disabled={authFailed}
                style={{ fontSize: "16px", padding: "1rem", width: "100%" }}
            />
        </div>
    );
}