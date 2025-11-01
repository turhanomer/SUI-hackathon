import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../utility/store";
import { Achievements } from "../components/Achievements";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const account = useCurrentAccount();
  const ensure = useStore((s) => s.ensureProfile);
  const upsert = useStore((s) => s.upsertProfile);
  const mintPass = useStore((s) => s.mintCreatorPass);

  const profile = useMemo(() => (account ? ensure(account.address) : undefined), [account, ensure]);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName || "");
    setAvatarUrl(profile.avatarUrl || "");
    setBio(profile.bio || "");
  }, [profile]);

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div style={{ maxWidth: 380 }}>
        <div className="card-modern" style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 800 }}>Account Settings</div>
          {!account && <div className="muted">Lütfen cüzdanınızı bağlayın.</div>}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <img
              src={(avatarUrl || (account ? `https://api.dicebear.com/9.x/identicon/svg?seed=${account.address}` : ""))}
              style={{ width: 56, height: 56, borderRadius: 10 }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>{profile?.displayName ?? "Guest"}</div>
              {account && <div className="muted" style={{ fontSize: 12 }}>{account.address.slice(0, 6)}…{account.address.slice(-4)}</div>}
            </div>
          </div>

          <label>
            <div className="muted" style={{ fontSize: 12 }}>Display Name</div>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Adınız" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB" }} />
          </label>
          <label>
            <div className="muted" style={{ fontSize: 12 }}>Avatar URL</div>
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB" }} />
          </label>
          <label>
            <div className="muted" style={{ fontSize: 12 }}>Biyografi</div>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Hakkında" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB" }} />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-primary"
              disabled={!account}
              onClick={() => {
                if (!account || !profile) return;
                upsert({ ...profile, displayName: displayName || profile.displayName, avatarUrl, bio });
              }}
            >Kaydet</button>

            {!profile?.hasCreatorPass && (
              <button className="btn btn-accent" disabled={!account} onClick={() => account && mintPass(account.address)}>
                Mint Creator Pass
              </button>
            )}
          </div>

          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Achievements</div>
            <Achievements items={profile?.achievements ?? []} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/profile" className="btn btn-ghost">Full Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


