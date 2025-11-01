import { useParams } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useStore } from "../utility/store";
import { PollChart } from "../components/PollChart";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { QuickCreatePoll } from "../components/QuickCreatePoll";

export default function VotePage() {
  const { id } = useParams();
  const account = useCurrentAccount();
  const poll = useStore((s) => (id ? s.polls[id] : undefined));
  const vote = useStore((s) => s.vote);

  if (!poll) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <div className="card">Poll not found.</div>
      </div>
    );
  }

  const total = Object.values(poll.votes).reduce((a, b) => a + b, 0);

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 380px", gap: 16, alignItems: "start" }}>
        <ProfileSidebar />

        <div className="card-modern" style={{ display: "grid", gap: 12 }}>
          <h2>{poll.question}</h2>
          {poll.description && <p className="muted">{poll.description}</p>}
          {poll.imageUrl && <img src={poll.imageUrl} style={{ maxHeight: 220, objectFit: "cover", borderRadius: 12 }} />}

          <div style={{ display: "grid", gap: 8 }}>
            {poll.options.map((o) => (
              <button
                key={o.id}
                className="btn btn-primary"
                onClick={() => account && vote(account.address, poll.id, o.id)}
                disabled={!account}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="muted" style={{ fontSize: 12 }}>Gerçek zamanlı sonuçlar</div>
          <PollChart poll={poll} />
          <div className="muted" style={{ fontSize: 12 }}>{total} toplam oy</div>
        </div>

        <QuickCreatePoll />
      </div>
    </div>
  );
}


