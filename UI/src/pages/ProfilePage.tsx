import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMemo } from "react";
import { Achievements } from "../components/Achievements";
import { useStore } from "../utility/store";
import { HorizontalPollCard } from "../components/HorizontalPollCard";
import { LevelBar } from "../components/LevelBar";

export default function ProfilePage() {
  const account = useCurrentAccount();
  const ensure = useStore((s) => s.ensureProfile);
  const polls = useStore((s) => s.polls);

  const profile = useMemo(() => {
    if (!account) return undefined;
    return ensure(account.address);
  }, [account, ensure]);

  if (!account) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <div className="card">Please connect your wallet first.</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "12px 0 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Left: compact profile card */}
          <div className="card-modern" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <LevelBar address={account.address} avatarUrl={profile?.avatarUrl} size={112} />
            </div>
            <div style={{ fontWeight: 800, marginTop: 8 }}>{profile?.displayName ?? "User"}</div>
            <div className="muted" style={{ fontSize: 12 }}>{account.address.slice(0, 6)}…{account.address.slice(-4)}</div>
            {profile?.bio && <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{profile.bio}</p>}
          </div>

          {/* Settings + Create Poll shortcuts */}
          <div className="card-modern" style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
            <a className="btn btn-secondary" href="/settings">Open Settings</a>
            <a className="btn btn-accent" href="/create">Create Poll</a>
          </div>

          {/* Achievements */}
          <div className="card-modern">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Başarımlar</div>
            <Achievements items={profile?.achievements ?? []} />
          </div>
        </div>

        {/* Right: polls created by this profile */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontSize: 22 }}>Oluşturulan Anketler</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {Object.values(polls).filter((p) => p.createdBy === account.address).map((p) => (
              <HorizontalPollCard key={p.id} poll={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


