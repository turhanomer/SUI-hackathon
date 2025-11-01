import { useLevelInfo } from "../utility/levels";

export function LevelBar({ address, avatarUrl, size = 96 }: { address?: string; avatarUrl?: string; size?: number }) {
  const info = useLevelInfo(address);

  const src = avatarUrl || (address ? `https://api.dicebear.com/9.x/identicon/svg?seed=${address}` : "");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <img src={src} alt="avatar" style={{ width: size, height: size, borderRadius: 12, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 8, top: 8, background: "rgba(11,19,36,0.85)", color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
        Lv {info.level}
      </div>
      <div style={{ position: "absolute", left: 8, right: 8, bottom: 8, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.6)", overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
        <div style={{ width: `${info.progressPercent}%`, height: "100%", background: "var(--color-primary)" }} />
      </div>
    </div>
  );
}


