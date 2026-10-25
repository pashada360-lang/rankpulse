/* Real engine logos, used everywhere an engine is named. The source PNGs carry white
   backgrounds, so each logo sits in a small white rounded tile — the app-icon treatment
   integration pages use — which reads correctly on both dark and light surfaces. */
export const ENGINES = {
  google:     { name: "Google",     file: "google.png" },
  chatgpt:    { name: "ChatGPT",    file: "chatgpt.png" },
  perplexity: { name: "Perplexity", file: "perplexity.png" },
  gemini:     { name: "Gemini",     file: "gemini.png" },
  claude:     { name: "Claude",     file: "claude.png" },
};

export default function EngineLogo({ engine, size = 18, withName = false, className = "", style = {} }) {
  const e = ENGINES[engine]; if (!e) return null;
  const pad = Math.max(2, Math.round(size * .14));
  const tile = (
    <span style={{ width: size, height: size, borderRadius: Math.round(size * .26), background: "#fff", display: "inline-grid", placeItems: "center", flex: "none", boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.18)", ...style }}>
      <img src={`/img/logos/${e.file}`} alt={e.name} width={size - pad * 2} height={size - pad * 2} style={{ width: size - pad * 2, height: size - pad * 2, objectFit: "contain", display: "block" }} />
    </span>
  );
  if (!withName) return tile;
  return <span className={"elogo " + className} style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * .42) }}>{tile}<span>{e.name}</span></span>;
}

/* a compact row of all five, for "measured on" strips */
export function EngineRow({ size = 16, names = true, gap = 8 }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap, flexWrap: "wrap" }}>
    {Object.keys(ENGINES).map(k => <EngineLogo key={k} engine={k} size={size} withName={names} />)}
  </span>;
}
