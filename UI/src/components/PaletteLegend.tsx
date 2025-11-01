export function PaletteLegend() {
  const items = [
    { name: "Ana Renk (Primary)", hex: "#00B7C2", desc: "Sui’nin logosuna yakın mavi; arka plan ve buton vurguları." },
    { name: "İkincil Renk (Secondary)", hex: "#007A74", desc: "Denge ve derinlik; başlıklar ve kart arka planları." },
    { name: "Vurgu Rengi (Accent)", hex: "#FFD369", desc: "Yenilik ve ödül; özel CTA ve hover efektleri." },
    { name: "Arka Plan (Background)", hex: "#F9FAFB", desc: "Temiz ve premium görünüm; sayfa zemini." },
    { name: "Yazı Rengi (Text)", hex: "#2D2D2D", desc: "Güvenli kontrast; uzun metinler için ideal." },
    { name: "Ekstra Ton (Highlight)", hex: "#FF6F59", desc: "Enerji ve sıcaklık; önemli vurgular için sınırlı kullanım." },
  ];

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Renk Paleti</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it) => (
          <div key={it.hex} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 18, height: 18, borderRadius: 6, background: it.hex, border: "1px solid #E5E7EB" }} />
            <div style={{ fontWeight: 600 }}>{it.name}</div>
            <code style={{ background: "#F2F4F7", padding: "2px 6px", borderRadius: 6 }}>{it.hex}</code>
            <div className="muted" style={{ marginLeft: 8 }}>{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


