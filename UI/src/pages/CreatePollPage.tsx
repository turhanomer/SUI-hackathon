import { useCurrentAccount } from "@mysten/dapp-kit";
import { FormEvent, useState } from "react";
import { createOption, useStore } from "../utility/store";

export default function CreatePollPage() {
  const account = useCurrentAccount();
  const createPoll = useStore((s) => s.createPoll);

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState(() => [createOption("Option A"), createOption("Option B")]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!account) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <div className="card">Please connect your wallet to create a poll.</div>
      </div>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (!account) throw new Error("Please connect your wallet");
      if (!question.trim()) throw new Error("Question is required");
      const nonEmpty = options.filter((o) => o.label.trim().length > 0);
      if (nonEmpty.length < 2) throw new Error("At least two options are required");
      const id = createPoll({
        question: question.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        options: nonEmpty,
        createdBy: account.address,
      });
      setSuccess(`Poll created! ID: ${id}`);
      setQuestion(""); setDescription(""); setImageUrl(""); setOptions([createOption("Option A"), createOption("Option B")]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="container" style={{ padding: "24px 0", maxWidth: 820 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>Create a Poll</h2>
      <form className="card" onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div className="muted" style={{ fontSize: 12 }}>Question</div>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What should we build next?" required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB" }} />
          </label>
          <label>
            <div className="muted" style={{ fontSize: 12 }}>Short Description (optional)</div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB" }} />
          </label>
          <label>
            <div className="muted" style={{ fontSize: 12 }}>Image URL (optional)</div>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E5E7EB" }} />
          </label>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Options</div>
            <div style={{ display: "grid", gap: 8 }}>
              {options.map((opt, idx) => (
                <div key={opt.id} style={{ display: "flex", gap: 8 }}>
                  <input
                    value={opt.label}
                    onChange={(e) => {
                      const next = [...options];
                      next[idx] = { ...opt, label: e.target.value };
                      setOptions(next);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #E5E7EB" }}
                  />
                  <button type="button" className="btn btn-ghost" onClick={() => setOptions(options.filter((o) => o.id !== opt.id))}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={() => setOptions([...options, createOption("")])}>
                Add Option
              </button>
            </div>
          </div>

          {error && <div style={{ color: "#B42318" }}>{error}</div>}
          {success && <div style={{ color: "#027A48" }}>{success}</div>}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn btn-accent">Publish Poll</button>
          </div>
        </div>
      </form>

      <div className="card" style={{ marginTop: 12, background: "#FFFBEB" }}>
        <strong style={{ color: "#92400E" }}>Poll Limit</strong>
        <p className="muted" style={{ marginTop: 6 }}>
          You can create 1 poll for free. To create more, mint the Creator Pass on your Profile page.
        </p>
      </div>
    </div>
  );
}


