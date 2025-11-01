import { Link } from "react-router-dom";
import type { Poll } from "../types/poll";

export function HorizontalPollCard({ poll }: { poll: Poll }) {
  const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
  return (
    <div className="card-modern card-horizontal">
      {poll.imageUrl ? (
        <img src={poll.imageUrl} alt="poll" className="card-horizontal-thumb" />
      ) : (
        <div className="card-horizontal-thumb" style={{ background: "#ECFDF5" }} />
      )}
      <div className="card-horizontal-body">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div>
            <h3 style={{ marginBottom: 4 }}>{poll.question}</h3>
            {poll.description && <p className="muted" style={{ fontSize: 14 }}>{poll.description}</p>}
          </div>
          <div className="muted" style={{ whiteSpace: "nowrap", fontSize: 12 }}>{new Date(poll.createdAt).toLocaleDateString()}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div className="muted" style={{ fontSize: 12 }}>{totalVotes} votes</div>
          <Link to={`/vote/${poll.id}`} className="btn btn-primary">Vote</Link>
        </div>
      </div>
    </div>
  );
}


