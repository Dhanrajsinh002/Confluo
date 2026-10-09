interface Prop {
    count: number;
}

export default function PresenceBar({ count }: Prop) {
    return (
        <div style={{ padding: "0.5rem 1rem", background: "#f0f0f0", borderRadius: 4, marginBottom: "1rem" }}>
            👥 { count } { count === 1 ? "person": "people" } viewing
        </div>
    );
}
