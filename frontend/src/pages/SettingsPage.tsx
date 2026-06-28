import { useThemeStore } from "../store/useThemeStore";
import { Palette, Check, Type, Image } from "lucide-react";

const THEMES = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
  "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
  "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade",
  "night", "coffee", "winter",
];

const THEME_ICONS: Record<string, string> = {
  light: "☀️", dark: "🌙", cupcake: "🧁", bumblebee: "🐝",
  emerald: "💎", corporate: "💼", synthwave: "🌆", retro: "📻",
  cyberpunk: "⚡", valentine: "💝", halloween: "🎃", garden: "🌸",
  forest: "🌲", aqua: "🌊", lofi: "🎵", pastel: "🎨", fantasy: "🔮",
  wireframe: "📐", black: "🖤", luxury: "👑", dracula: "🧛",
  cmyk: "🖨️", autumn: "🍂", business: "📊", acid: "🧪",
  lemonade: "🍋", night: "🌃", coffee: "☕", winter: "❄️",
};

// DaisyUI theme colors — hardcoded so they actually show correctly
const THEME_COLORS: Record<string, string[]> = {
  light:     ["#570df8","#f000b8","#37cdbe","#3d4451"],
  dark:      ["#661ae6","#d926aa","#1fb2a5","#a6adbb"],
  cupcake:   ["#65c3c8","#ef9fbc","#eeaf3a","#291334"],
  bumblebee: ["#e0a82e","#181830","#181830","#181830"],
  emerald:   ["#66cc8a","#377cfb","#f68067","#333c4d"],
  corporate: ["#4b6bfb","#7b92b2","#67cba0","#181a2a"],
  synthwave: ["#e779c1","#58c7f3","#f3cc30","#221551"],
  retro:     ["#ef9900","#dc2626","#65c3c8","#282425"],
  cyberpunk: ["#ff7598","#75d1f0","#c07eec","#423f00"],
  valentine: ["#e96d7b","#a991f7","#88dbdd","#632c3b"],
  halloween: ["#f28c18","#6d3a9c","#51a800","#212121"],
  garden:    ["#5c7f67","#ecb7b7","#f0e6d3","#100f0f"],
  forest:    ["#1eb854","#1db88e","#1db8ab","#19362d"],
  aqua:      ["#09ecf3","#966fb3","#ffe999","#345da7"],
  lofi:      ["#0d0d0d","#1a1a1a","#262626","#808080"],
  pastel:    ["#d1c1d7","#f2c9d0","#b5e4d6","#403c4a"],
  fantasy:   ["#6e0b75","#007ebd","#4cbb17","#1f1f1f"],
  wireframe: ["#b8b8b8","#b8b8b8","#b8b8b8","#b8b8b8"],
  black:     ["#343232","#343232","#343232","#343232"],
  luxury:    ["#ffffff","#152747","#513448","#09090b"],
  dracula:   ["#ff79c6","#bd93f9","#ffb86c","#282a36"],
  cmyk:      ["#45aeee","#e8488a","#ffe600","#403e41"],
  autumn:    ["#8c0327","#d85251","#d59b6a","#201720"],
  business:  ["#1c4f82","#7b2d8b","#00a96e","#1d232a"],
  acid:      ["#ff00f4","#ff7400","#00ffcc","#1a1a1a"],
  lemonade:  ["#519903","#e9e92e","#f7f7f7","#141301"],
  night:     ["#38bdf8","#818cf8","#f471b5","#1e293b"],
  coffee:    ["#db924b","#263e3f","#10576d","#120d0e"],
  winter:    ["#047aed","#463aa1","#c148ac","#021431"],
};

const WALLPAPERS = [
  { id: "none",      label: "None",      style: { background: "var(--fallback-b1,oklch(var(--b1)))" } },
  { id: "dots",      label: "Dots",      style: { backgroundImage: "radial-gradient(circle, #888 1px, transparent 1px)", backgroundSize: "20px 20px" } },
  { id: "grid",      label: "Grid",      style: { backgroundImage: "linear-gradient(rgba(128,128,128,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.15) 1px, transparent 1px)", backgroundSize: "24px 24px" } },
  { id: "waves",     label: "Waves",     style: { backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.1) 10px, rgba(128,128,128,0.1) 20px)" } },
  { id: "bubbles",   label: "Bubbles",   style: { backgroundImage: "radial-gradient(circle at 20% 50%, rgba(120,119,198,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.15) 0%, transparent 50%)" } },
  { id: "diagonal",  label: "Lines",     style: { backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(128,128,128,0.08) 5px, rgba(128,128,128,0.08) 6px)" } },
  { id: "gradient1", label: "Sunset",    style: { background: "linear-gradient(135deg, rgba(255,154,100,0.2), rgba(208,112,150,0.2))" } },
  { id: "gradient2", label: "Ocean",     style: { background: "linear-gradient(135deg, rgba(100,200,255,0.2), rgba(50,100,200,0.2))" } },
  { id: "gradient3", label: "Forest",    style: { background: "linear-gradient(135deg, rgba(100,200,100,0.2), rgba(50,150,80,0.2))" } },
];

const FONT_SIZES = [
  { id: "small",  label: "Small",  size: "13px", preview: "Aa" },
  { id: "medium", label: "Medium", size: "15px", preview: "Aa" },
  { id: "large",  label: "Large",  size: "18px", preview: "Aa" },
];

const SettingsPage = () => {
  const { theme, setTheme, fontSize, setFontSize, wallpaper, setWallpaper } = useThemeStore();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0f1a",
      padding: "80px 20px 40px",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        .sw { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
        .sh { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
        .sib { width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6c7bff,#818cf8);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(108,123,255,.35);flex-shrink:0; }
        .st { font-size:22px;font-weight:800;color:#e8eaf6;letter-spacing:-.03em; }
        .ss { font-size:13px;color:#636890;margin-top:2px; }
        .sc { background:#1c1e2e;border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:22px; }
        .sl { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#636890;margin-bottom:16px;display:flex;align-items:center;gap:8px; }
        .sl::after { content:'';flex:1;height:1px;background:rgba(255,255,255,.06); }
        .sl svg { color: #818cf8; }

        /* Theme grid */
        .tg { display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px; }
        .tb { background:#252740;border:1.5px solid rgba(255,255,255,.06);border-radius:14px;padding:10px 8px 8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:7px;transition:border-color .18s,background .18s,transform .12s;position:relative;overflow:hidden; }
        .tb:hover { border-color:rgba(108,123,255,.35);background:#2e3156;transform:translateY(-1px); }
        .tb.active { border-color:#6c7bff;background:rgba(108,123,255,.12);box-shadow:0 0 0 1px rgba(108,123,255,.2),0 4px 14px rgba(108,123,255,.15); }
        .tp { width:100%;height:36px;border-radius:8px;overflow:hidden;display:flex;gap:2px;padding:4px; }
        .ts-sw { flex:1;border-radius:3px; }
        .te { font-size:14px;line-height:1; }
        .tn { font-size:10.5px;font-weight:600;color:#8b90b8;text-align:center;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
        .tb.active .tn { color:#818cf8; }
        .cb { position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:#6c7bff;display:flex;align-items:center;justify-content:center; }

        /* Font size */
        .fg { display:flex;gap:10px; }
        .fb { flex:1;background:#252740;border:1.5px solid rgba(255,255,255,.06);border-radius:14px;padding:16px 12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .18s;position:relative; }
        .fb:hover { border-color:rgba(108,123,255,.35);background:#2e3156; }
        .fb.active { border-color:#6c7bff;background:rgba(108,123,255,.12); }
        .fp { font-weight:700;color:#e8eaf6;line-height:1; }
        .fl { font-size:11px;color:#8b90b8;font-weight:600; }
        .fb.active .fl { color:#818cf8; }

        /* Wallpaper */
        .wg { display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px; }
        .wb { background:#252740;border:1.5px solid rgba(255,255,255,.06);border-radius:14px;padding:6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .18s;position:relative;overflow:hidden; }
        .wb:hover { border-color:rgba(108,123,255,.35);transform:translateY(-1px); }
        .wb.active { border-color:#6c7bff;box-shadow:0 0 0 1px rgba(108,123,255,.2); }
        .wp { width:100%;height:56px;border-radius:10px;overflow:hidden; }
        .wl { font-size:10.5px;font-weight:600;color:#8b90b8; }
        .wb.active .wl { color:#818cf8; }

        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .cb { animation: popIn .2s ease; }
        .glow1 { position:fixed;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(108,123,255,.09),transparent 70%);top:-100px;left:-100px;pointer-events:none;filter:blur(60px); }
        .glow2 { position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(167,139,250,.06),transparent 70%);bottom:0;right:0;pointer-events:none;filter:blur(60px); }
      `}</style>

      <div className="glow1" />
      <div className="glow2" />

      <div className="sw">
        {/* Header */}
        <div className="sh">
          <div className="sib"><Palette size={20} color="#fff" /></div>
          <div>
            <div className="st">Settings</div>
            <div className="ss">Customise your BlinkTalk experience</div>
          </div>
        </div>

        {/* ── Theme ── */}
        <div className="sc">
          <div className="sl"><Palette size={13} /> Themes</div>
          <div className="tg">
            {THEMES.map((t) => {
              const colors = THEME_COLORS[t] || ["#888","#999","#aaa","#333"];
              return (
                <button key={t} className={`tb${theme === t ? " active" : ""}`} onClick={() => setTheme(t)}>
                  {theme === t && <div className="cb"><Check size={9} color="#fff" strokeWidth={3} /></div>}
                  <div className="tp">
                    {colors.map((c, i) => (
                      <div key={i} className="ts-sw" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="te">{THEME_ICONS[t] ?? "🎨"}</span>
                  <span className="tn">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Font Size ── */}
        <div className="sc">
          <div className="sl"><Type size={13} /> Font Size</div>
          <div className="fg">
            {FONT_SIZES.map((f) => (
              <button key={f.id} className={`fb${fontSize === f.id ? " active" : ""}`} onClick={() => setFontSize(f.id as any)}>
                {fontSize === f.id && <div className="cb" style={{top:6,right:6}}><Check size={9} color="#fff" strokeWidth={3} /></div>}
                <span className="fp" style={{ fontSize: f.size }}>{f.preview}</span>
                <span className="fl">{f.label}</span>
              </button>
            ))}
          </div>
          {/* Live preview */}
          <div style={{ marginTop: 14, padding: "12px 16px", background: "#252740", borderRadius: 12, color: "#e8eaf6", fontSize: fontSize === "small" ? 13 : fontSize === "large" ? 18 : 15, transition: "font-size .2s" }}>
            Preview: Hey! How are you doing today? 👋
          </div>
        </div>

        {/* ── Wallpaper ── */}
        <div className="sc">
          <div className="sl"><Image size={13} /> Chat Wallpaper</div>
          <div className="wg">
            {WALLPAPERS.map((w) => (
              <button key={w.id} className={`wb${wallpaper === w.id ? " active" : ""}`} onClick={() => setWallpaper(w.id)}>
                {wallpaper === w.id && <div className="cb"><Check size={9} color="#fff" strokeWidth={3} /></div>}
                <div className="wp" style={w.style} />
                <span className="wl">{w.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;