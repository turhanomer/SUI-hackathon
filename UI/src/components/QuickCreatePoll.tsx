import { useCurrentAccount } from "@mysten/dapp-kit";
import { FormEvent, useState } from "react";
import { createOption, useStore } from "../utility/store";

export function QuickCreatePoll() {
  const account = useCurrentAccount();
  const createPoll = useStore((s) => s.createPoll);
  const [question, setQuestion] = useState("");
  const [optA, setOptA] = useState("Yes");
  const [optB, setOptB] = useState("No");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setOk(null);
    try {
      if (!account) throw new Error("Cüzdan bağlayın");
      if (!question.trim()) throw new Error("Soru gerekli");
      const options = [optA, optB].map((l) => l.trim()).filter(Boolean).map(createOption);
      if (options.length < 2) throw new Error("En az iki seçenek");
      const id = createPoll({ question: question.trim(), options, createdBy: account.address });
      setOk(`Anket oluşturuldu (#${id.slice(0, 6)}…)`);
      setQuestion(""); setOptA("Yes"); setOptB("No");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="card-modern">
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Hızlı Anket Oluştur</div>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Soru" value={question} onChange={(e) => setQuestion(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #E5E7EB" }} />
        <input placeholder="Seçenek A" value={optA} onChange={(e) => setOptA(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #E5E7EB" }} />
        <input placeholder="Seçenek B" value={optB} onChange={(e) => setOptB(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #E5E7EB" }} />
        {error && <div style={{ color: "#B42318" }}>{error}</div>}
        {ok && <div style={{ color: "#027A48" }}>{ok}</div>}
        <button className="vote-btn" type="submit" disabled={!account}>Oluştur</button>
      </form>
      {!account && <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>Anket oluşturmak için cüzdan bağlayın.</div>}
    </div>
  );
}


