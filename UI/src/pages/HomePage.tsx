import { Link, useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useStore } from "../utility/store";
import { PollCard } from "../components/PollCard";
import { useEffect, useMemo } from "react";
import { PaletteLegend } from "../components/PaletteLegend";

const categories = [
  { title: "DeFi Projects", icon: "💸" },
  { title: "Gaming & Metaverse", icon: "🎮" },
  { title: "Infrastructure & Tooling", icon: "🧩" },
  { title: "Bridge Solutions", icon: "🌉" },
  { title: "Innovation Labs", icon: "⚙️" },
  { title: "Community Impact", icon: "🔎" },
];

export default function HomePage() {
  const account = useCurrentAccount();
  const pollsMap = useStore((s) => s.polls);
  const polls = useMemo(() => Object.values(pollsMap).sort((a, b) => b.createdAt - a.createdAt), [pollsMap]);
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      const key = `visitedProfile:${account.address}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        navigate("/profile");
      }
    }
  }, [account, navigate]);

  return (
    <div>
      <section className="hero ornaments">
        <div className="container" style={{ paddingBottom: 20 }}>
          <h1 className="title" style={{ fontSize: 48, marginBottom: 6 }}>SUI HACKATHON 2024</h1>
          <p className="subtitle" style={{ marginBottom: 26 }}>JUDGE. CHOSE. INNOVATE.</p>

          <div className="category-grid" style={{ marginTop: 24 }}>
            {categories.map((c) => (
              <div key={c.title} className="card-modern">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>{c.icon}</span>
                  <strong>{c.title}</strong>
                </div>
                <Link to="/polls" className="vote-btn">VOTE NOW</Link>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            {account ? (
              <Link to="/profile" className="btn btn-secondary">Profile</Link>
            ) : (
              <span className="subtitle">Connect wallet to create profile</span>
            )}
            <Link to="/create" className="btn btn-accent">Create a Poll</Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 22 }}>Trending Polls</h2>
          <Link to="/polls" className="btn btn-ghost">See all</Link>
        </div>
        <div className="grid-3">
          {polls.slice(0, 6).map((p) => (
            <PollCard key={p.id} poll={p} />
          ))}
          {polls.length === 0 && (
            <div className="card">
              <p>No polls yet. Be the first to create one!</p>
              <Link to="/create" className="btn btn-accent" style={{ marginTop: 10 }}>Create Poll</Link>
            </div>
          )}
        </div>
        <PaletteLegend />
      </section>
    </div>
  );
}


