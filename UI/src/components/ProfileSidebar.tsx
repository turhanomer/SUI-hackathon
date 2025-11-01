import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMemo } from "react";
import { Achievements } from "./Achievements";
import { useStore } from "../utility/store";

export function ProfileSidebar() {
  const account = useCurrentAccount();
  const profiles = useStore((s) => s.profiles);
  const polls = useStore((s) => s.polls);
  const votesByWallet = useStore((s) => s.votesByWallet);

  const profile = useMemo(() => (account ? profiles[account.address] : undefined), [profiles, account]);

  const stats = useMemo(() => {
    const address = account?.address;
    if (!address) return { created: 0, votesCast: 0, votesReceived: 0 };
    const createdPolls = Object.values(polls).filter((p) => p.createdBy === address);
    const votesCast = Object.keys(votesByWallet[address] ?? {}).length;
    const votesReceived = createdPolls.reduce((acc, p) => acc + Object.values(p.votes).reduce((a, b) => a + b, 0), 0);
    return { created: createdPolls.length, votesCast, votesReceived };
  }, [account, polls, votesByWallet]);

  return (
    <aside style={{ display: "grid", gap: 12 }}>
      <div className="card-modern" style={{ textAlign: "center" }}>
        <img
          src={(profile?.avatarUrl) || `https://api.dicebear.com/9.x/identicon/svg?seed=${account?.address ?? "anon"}`}
          alt="avatar"
          style={{ width: 88, height: 88, borderRadius: 14, margin: "0 auto" }}
        />
        <div style={{ fontWeight: 800, marginTop: 8 }}>{profile?.displayName ?? "Guest"}</div>
        {account && (
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{account.address.slice(0, 6)}…{account.address.slice(-4)}</div>
        )}
        <div style={{ marginTop: 10 }}>
          <Achievements items={profile?.achievements ?? []} />
        </div>
      </div>

      <div className="card-modern">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>İstatistik</div>
        <div style={{ display: "grid", gap: 8 }}>
          <StatRow label="Oluşturulan Anket" value={stats.created} />
          <StatRow label="Kullanıcı Oyları" value={stats.votesCast} />
          <StatRow label="Alınan Oylar" value={stats.votesReceived} />
        </div>
      </div>
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}


