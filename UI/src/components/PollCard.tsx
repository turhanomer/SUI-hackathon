import { Link } from "react-router-dom";
import type { Poll } from "../types/poll";
import { PollChart } from "./PollChart";

export function PollCard({ poll }: { poll: Poll }) {
  const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        {poll.imageUrl ? (
          <img src={poll.imageUrl} alt="poll" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10 }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 10, background: "#ECFDF5" }} />
        )}
        <div>
          <h3 style={{ marginBottom: 4 }}>{poll.question}</h3>
          {poll.description && <p className="muted" style={{ fontSize: 14 }}>{poll.description}</p>}
        </div>
      </div>

      <PollChart poll={poll} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="muted" style={{ fontSize: 12 }}>{new Date(poll.createdAt).toLocaleString()}</span>
        <span className="muted" style={{ fontSize: 12 }}>{totalVotes} votes</span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link to={`/vote/${poll.id}`} className="btn btn-primary">Vote Now</Link>
      </div>
    </div>
  );
}


