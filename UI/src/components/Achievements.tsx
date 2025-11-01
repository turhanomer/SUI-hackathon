import type { AchievementKey } from "../types/poll";

const LABELS: Record<AchievementKey, { title: string; color: string }> = {
  first_vote: { title: "First Vote", color: "#00B7C2" },
  first_poll: { title: "First Poll Created", color: "#007A74" },
  creator_pass_minted: { title: "Creator Pass Minted", color: "#FFD369" },
  ten_votes_received: { title: "10+ Votes Received", color: "#FF6F59" },
};

export function Achievements({ items }: { items: AchievementKey[] }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
      {items.map((key) => (
        <span
          key={key}
          className="card"
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            background: LABELS[key].color,
            color: key === "creator_pass_minted" ? "#1b1b1b" : "white",
            fontSize: 12,
            boxShadow: "none",
          }}
        >
          {LABELS[key].title}
        </span>
      ))}
    </div>
  );
}


