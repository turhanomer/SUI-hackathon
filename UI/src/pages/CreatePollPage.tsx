import { useCurrentAccount } from "@mysten/dapp-kit";
import { FormEvent, useState, useEffect } from "react";
import { useSuiContracts } from "../utility/useSuiContracts";

export default function CreatePollPage() {
  const account = useCurrentAccount();
  const { 
    createSurvey, 
    createSurveyWithBadge,
    getUserBadges,
    getUserSurveys,
    isLoading,
    error: contractError 
  } = useSuiContracts();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["Option A", "Option B"]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [userSurveyCount, setUserSurveyCount] = useState(0);

  useEffect(() => {
    if (account) {
      loadUserData();
    }
  }, [account]);

  const loadUserData = async () => {
    // Badge'leri yükle
    const userBadges = await getUserBadges();
    setBadges(userBadges);

    // Kullanıcının oluşturduğu anket sayısını yükle
    const surveys = await getUserSurveys();
    setUserSurveyCount(surveys.length);
  };

  if (!account) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <div className="card">Please connect your wallet to create a poll.</div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (!account) throw new Error("Please connect your wallet");
      if (!question.trim()) throw new Error("Question is required");
      
      const nonEmpty = options.filter((o) => o.trim().length > 0);
      if (nonEmpty.length < 2) throw new Error("At least two options are required");

      // Survey parametrelerini hazırla
      const surveyParams = {
        title: question.trim(),
        description: description.trim() || "No description",
        questions: [{
          prompt: question.trim(),
          options: nonEmpty,
          allows_multiple: false,
          max_selections: 1,
        }],
      };

      let result;
      if (selectedBadge) {
        // Badge ile oluştur
        result = await createSurveyWithBadge(surveyParams, selectedBadge);
      } else {
        // Bedava oluştur
        result = await createSurvey(surveyParams);
      }

      if (result) {
        setSuccess(`Poll created successfully! 🎉`);
        setQuestion("");
        setDescription("");
        setOptions(["Option A", "Option B"]);
        setSelectedBadge(null);
        
        // Anket listesini yeniden yükle
        loadUserData();
      }
    } catch (err: any) {
      console.error("Create poll error:", err);
      setError(err.message || "Failed to create poll");
    }
  }

  const remainingFreeSurveys = Math.max(0, 3 - userSurveyCount);
  const canCreateFreeSurvey = remainingFreeSurveys > 0;

  return (
    <div className="container" style={{ padding: "24px 0", maxWidth: 820 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>Create a Poll</h2>

      {/* Badge Seçimi */}
      {badges.length > 0 && (
        <div className="card" style={{ marginBottom: 16, background: "#F0F9FF" }}>
          <strong style={{ color: "#1E40AF" }}>Your Creator Badges</strong>
          <p className="muted" style={{ marginTop: 6, marginBottom: 12, fontSize: 14 }}>
            Use a badge to create unlimited polls!
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge.id === selectedBadge ? null : badge.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: badge.id === selectedBadge ? "2px solid #2563EB" : "1px solid #E5E7EB",
                  background: badge.id === selectedBadge ? "#EFF6FF" : "white",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {badge.name} (Tier {badge.tier})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Limit Uyarısı */}
      <div 
        className="card" 
        style={{ 
          marginBottom: 16, 
          background: canCreateFreeSurvey ? "#FFFBEB" : "#FEF2F2" 
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ color: canCreateFreeSurvey ? "#92400E" : "#991B1B" }}>
              {selectedBadge ? "Creating with Badge" : `Free Polls: ${remainingFreeSurveys}/3`}
            </strong>
            <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
              {selectedBadge 
                ? "You're using a Creator Badge - unlimited polls!" 
                : canCreateFreeSurvey
                  ? "You can create more polls by minting a Creator Badge."
                  : "You've used all free polls. Get a Creator Badge to continue!"
              }
            </p>
          </div>
        </div>
      </div>

      <form className="card" onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div className="muted" style={{ fontSize: 12 }}>Question</div>
            <input 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)} 
              placeholder="What should we build next?" 
              required 
              style={{ 
                width: "100%", 
                padding: 10, 
                borderRadius: 8, 
                border: "1px solid #E5E7EB" 
              }} 
            />
          </label>
          
          <label>
            <div className="muted" style={{ fontSize: 12 }}>Short Description (optional)</div>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
              placeholder="Describe your poll..."
              style={{ 
                width: "100%", 
                padding: 10, 
                borderRadius: 8, 
                border: "1px solid #E5E7EB" 
              }} 
            />
          </label>
          
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Options</div>
            <div style={{ display: "grid", gap: 8 }}>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8 }}>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = e.target.value;
                      setOptions(next);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    style={{ 
                      flex: 1, 
                      padding: 10, 
                      borderRadius: 8, 
                      border: "1px solid #E5E7EB" 
                    }}
                  />
                  {options.length > 2 && (
                    <button 
                      type="button" 
                      className="btn btn-ghost" 
                      onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setOptions([...options, ""])}
              >
                Add Option
              </button>
            </div>
          </div>

          {(error || contractError) && (
            <div style={{ color: "#B42318", padding: 12, background: "#FEF2F2", borderRadius: 8 }}>
              {error || contractError}
            </div>
          )}
          
          {success && (
            <div style={{ color: "#027A48", padding: 12, background: "#F0FDF4", borderRadius: 8 }}>
              {success}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button 
              type="submit" 
              className="btn btn-accent"
              disabled={isLoading || (!canCreateFreeSurvey && !selectedBadge)}
            >
              {isLoading ? "Creating..." : selectedBadge ? "Create with Badge" : "Create Free Poll"}
            </button>
          </div>
        </div>
      </form>

      {/* Badge Mint Bilgisi */}
      {!canCreateFreeSurvey && badges.length === 0 && (
        <div className="card" style={{ marginTop: 12, background: "#EFF6FF" }}>
          <strong style={{ color: "#1E40AF" }}>Get Creator Badge</strong>
          <p className="muted" style={{ marginTop: 6 }}>
            To create unlimited polls, you need a Creator Badge NFT. 
            Contact the admin to mint a badge for your wallet.
          </p>
          <div style={{ marginTop: 12, padding: 12, background: "#DBEAFE", borderRadius: 8, fontSize: 14 }}>
            <strong>Your Wallet:</strong>
            <div style={{ marginTop: 4, fontFamily: "monospace", fontSize: 12 }}>
              {account.address}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
