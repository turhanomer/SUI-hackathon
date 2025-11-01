import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { Transaction } from "@mysten/sui/transactions";

// Admin adresi - deploy yapan kişi
const ADMIN_ADDRESS = "0x462e58792e3a15a87e892c8e16eb6e080057aa18985df27e82ea57efc3eb36d9";

export default function AdminPage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const ADMIN_CAP_ID = useNetworkVariable("ADMIN_CAP_ID");
  const PACKAGE_ID = useNetworkVariable("PACKAGE_ID");
  const BADGE_STATS_ID = useNetworkVariable("BADGE_STATS_ID");

  const [recipient, setRecipient] = useState("");
  const [tier, setTier] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = account?.address === ADMIN_ADDRESS;

  if (!account) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <div className="card">
          <h2>Admin Panel</h2>
          <p className="muted">Please connect your wallet to access admin functions.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <div className="card" style={{ background: "#FEF2F2" }}>
          <h2 style={{ color: "#991B1B" }}>Access Denied</h2>
          <p className="muted">You don't have admin privileges.</p>
          <div style={{ marginTop: 12, fontSize: 12, fontFamily: "monospace", color: "#6B7280" }}>
            Your address: {account.address}
          </div>
        </div>
      </div>
    );
  }

  const handleMintBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!recipient.startsWith("0x") || recipient.length !== 66) {
        throw new Error("Invalid Sui address format");
      }

      // Transaction oluştur
      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::badge::mint_creator_badge`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.object(BADGE_STATS_ID),
          tx.pure.u8(tier),
          tx.pure.address(recipient),
        ],
      });

      // Transaction'ı imzala ve gönder
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("Badge minted successfully:", result);
            setSuccess(`✅ Badge minted successfully! Transaction: ${result.digest.slice(0, 12)}...`);
            setRecipient("");
            setIsLoading(false);
          },
          onError: (err) => {
            console.error("Mint error:", err);
            setError(err.message || "Failed to mint badge");
            setIsLoading(false);
          },
        }
      );
    } catch (err: any) {
      console.error("Mint error:", err);
      setError(err.message || "Failed to mint badge");
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "24px 0", maxWidth: 820 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>🛡️ Admin Panel</h2>

      {/* Config Info */}
      <div className="card" style={{ marginBottom: 16, background: "#F0F9FF" }}>
        <strong style={{ color: "#1E40AF" }}>Contract Configuration</strong>
        <div style={{ marginTop: 12, display: "grid", gap: 8, fontSize: 12, fontFamily: "monospace" }}>
          <div>
            <span className="muted">Package ID:</span>
            <div style={{ marginTop: 4 }}>{PACKAGE_ID}</div>
          </div>
          <div>
            <span className="muted">Admin Cap ID:</span>
            <div style={{ marginTop: 4 }}>{ADMIN_CAP_ID}</div>
          </div>
          <div>
            <span className="muted">Badge Stats ID:</span>
            <div style={{ marginTop: 4 }}>{BADGE_STATS_ID}</div>
          </div>
        </div>
      </div>

      {/* Mint Badge Form */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Mint Creator Badge</h3>
        <form onSubmit={handleMintBadge}>
          <div style={{ display: "grid", gap: 16 }}>
            <label>
              <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                Recipient Address
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                required
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  fontFamily: "monospace",
                  fontSize: 14,
                }}
              />
            </label>

            <label>
              <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                Badge Tier
              </div>
              <select
                value={tier}
                onChange={(e) => setTier(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                }}
              >
                <option value={1}>Tier 1 - Bronze (1 extra survey)</option>
                <option value={2}>Tier 2 - Silver (1 extra survey)</option>
                <option value={3}>Tier 3 - Gold (1 extra survey)</option>
              </select>
            </label>

            {error && (
              <div style={{ color: "#B42318", padding: 12, background: "#FEF2F2", borderRadius: 8 }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: "#027A48", padding: 12, background: "#F0FDF4", borderRadius: 8 }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-accent"
              disabled={isLoading}
            >
              {isLoading ? "Minting..." : "Mint Badge NFT"}
            </button>
          </div>
        </form>
      </div>

      {/* Badge Tier Info */}
      <div className="card" style={{ marginTop: 16, background: "#FFFBEB" }}>
        <strong style={{ color: "#92400E" }}>Badge Tiers</strong>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ padding: 12, background: "#CD7F32", color: "white", borderRadius: 8 }}>
            <strong>🥉 Tier 1 - Bronze</strong>
            <p style={{ marginTop: 4, fontSize: 14, opacity: 0.9 }}>
              Allows 1 additional survey creation
            </p>
          </div>
          <div style={{ padding: 12, background: "#C0C0C0", color: "white", borderRadius: 8 }}>
            <strong>🥈 Tier 2 - Silver</strong>
            <p style={{ marginTop: 4, fontSize: 14, opacity: 0.9 }}>
              Allows 1 additional survey creation
            </p>
          </div>
          <div style={{ padding: 12, background: "#FFD700", color: "#78350F", borderRadius: 8 }}>
            <strong>🥇 Tier 3 - Gold</strong>
            <p style={{ marginTop: 4, fontSize: 14, opacity: 0.9 }}>
              Allows 1 additional survey creation
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: 16 }}>
        <strong>Quick Mint Actions</strong>
        <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
          Common addresses for testing
        </p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setRecipient(account.address)}
            style={{ justifyContent: "flex-start", textAlign: "left" }}
          >
            Use My Address ({account.address.slice(0, 8)}...)
          </button>
        </div>
      </div>
    </div>
  );
}
