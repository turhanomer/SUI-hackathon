import { useMemo } from "react";
import { useStore } from "../utility/store";
import { PollCard } from "../components/PollCard";

export default function PollsPage() {
  const pollsMap = useStore((s) => s.polls);
  const polls = useMemo(() => Object.values(pollsMap).sort((a, b) => b.createdAt - a.createdAt), [pollsMap]);
  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>All Polls</h2>
      <div className="grid-3">
        {polls.map((p) => (
          <PollCard key={p.id} poll={p} />
        ))}
        {polls.length === 0 && <div className="card">No polls available.</div>}
      </div>
    </div>
  );
}


