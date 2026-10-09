import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getAccessToken } from "./auth";

const FASTAPI_WS_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "ws://localhost:8001/ws";

export function createYjsConnection(documentId: string) {
    const ydoc = new Y.Doc();
    const token = getAccessToken();

    const provider = new WebsocketProvider(FASTAPI_WS_URL, documentId, ydoc, {
        params: { token: token || "" },
    });

    const ytext = ydoc.getText("shared-text");

    return { ydoc, provider, ytext };
}
