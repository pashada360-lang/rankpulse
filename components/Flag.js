/* Tiny inline-SVG flags. Emoji flags don't render on Windows, so these are drawn. */
const S = { width: 18, height: 12, borderRadius: 2, flex: "none", display: "inline-block", verticalAlign: "-1px", boxShadow: "0 0 0 1px rgba(0,0,0,.25)" };

export default function Flag({ code, size = 18 }) {
  const w = size, h = Math.round(size * 2 / 3);
  const st = { ...S, width: w, height: h };
  switch (code) {
    case "IN": return <svg viewBox="0 0 18 12" style={st}><rect width="18" height="4" fill="#FF9933" /><rect y="4" width="18" height="4" fill="#fff" /><rect y="8" width="18" height="4" fill="#138808" /><circle cx="9" cy="6" r="1.4" fill="none" stroke="#000080" strokeWidth=".6" /></svg>;
    case "US": return <svg viewBox="0 0 18 12" style={st}>{[0, 2, 4, 6, 8, 10].map(y => <rect key={y} y={y} width="18" height="1" fill="#B22234" />)}<rect width="18" height="12" fill="none" /><rect y="1" width="18" height="1" fill="#fff" /><rect y="3" width="18" height="1" fill="#fff" /><rect y="5" width="18" height="1" fill="#fff" /><rect y="7" width="18" height="1" fill="#fff" /><rect y="9" width="18" height="1" fill="#fff" /><rect y="11" width="18" height="1" fill="#fff" /><rect width="8" height="6" fill="#3C3B6E" /></svg>;
    case "ME": case "AE": return <svg viewBox="0 0 18 12" style={st}><rect width="18" height="4" fill="#00732F" /><rect y="4" width="18" height="4" fill="#fff" /><rect y="8" width="18" height="4" fill="#000" /><rect width="5" height="12" fill="#FF0000" /></svg>;
    case "EU": case "GB": return <svg viewBox="0 0 18 12" style={st}><rect width="18" height="12" fill="#012169" /><path d="M0 0L18 12M18 0L0 12" stroke="#fff" strokeWidth="2.4" /><path d="M0 0L18 12M18 0L0 12" stroke="#C8102E" strokeWidth="1" /><path d="M9 0V12M0 6H18" stroke="#fff" strokeWidth="4" /><path d="M9 0V12M0 6H18" stroke="#C8102E" strokeWidth="2" /></svg>;
    default: return null;
  }
}
