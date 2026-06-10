import { useThemeStore } from "../store/useThemeStore";
import { Palette, Check } from "lucide-react";

const THEMES = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
  "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
  "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade",
  "night", "coffee", "winter",
];

// Emoji to give each theme a personality
const THEME_ICONS: Record<string, string> = {
  light: "☀️", dark: "🌙", cupcake: "🧁", bumblebee: "🐝",
  emerald: "💎", corporate: "💼", synthwave: "🌆", retro: "📻",
  cyberpunk: "⚡", valentine: "💝", halloween: "🎃", garden: "🌸",
  forest: "🌲", aqua: "🌊", lofi: "🎵", pastel: "🎨", fantasy: "🔮",
  wireframe: "📐", black: "🖤", luxury: "👑", dracula: "🧛",
  cmyk: "🖨️", autumn: "🍂", business: "📊", acid: "🧪",
  lemonade: "🍋", night: "🌃", coffee: "☕", winter: "❄️",
};

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0f1a",
      padding: "80px 20px 40px",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative",
    }}>
      <style>{`
        .settings-wrap {
          max-width: 720px;
          margin: 0 auto;
        }

        .settings-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .settings-icon-box {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6c7bff, #818cf8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(108,123,255,0.35);
          flex-shrink: 0;
        }
        .settings-title {
          font-size: 22px;
          font-weight: 800;
          color: #e8eaf6;
          letter-spacing: -0.03em;
        }
        .settings-sub {
          font-size: 13px;
          color: #636890;
          margin-top: 2px;
        }

        .section-card {
          background: #1c1e2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 22px;
        }
        .section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #636890;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .themes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
          gap: 8px;
        }

        .theme-btn {
          background: #252740;
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 10px 8px 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          transition: border-color 0.18s, background 0.18s, transform 0.12s;
          position: relative;
          overflow: hidden;
        }
        .theme-btn:hover {
          border-color: rgba(108,123,255,0.35);
          background: #2e3156;
          transform: translateY(-1px);
        }
        .theme-btn.active {
          border-color: #6c7bff;
          background: rgba(108,123,255,0.12);
          box-shadow: 0 0 0 1px rgba(108,123,255,0.2), 0 4px 14px rgba(108,123,255,0.15);
        }

        .theme-preview {
          width: 100%;
          height: 36px;
          border-radius: 8px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 2px;
          padding: 4px;
        }
        .theme-swatch {
          border-radius: 3px;
        }

        .theme-emoji {
          font-size: 14px;
          line-height: 1;
        }
        .theme-name {
          font-size: 10.5px;
          font-weight: 600;
          color: #8b90b8;
          text-align: center;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .theme-btn.active .theme-name { color: #818cf8; }

        .check-badge {
          position: absolute;
          top: 6px; right: 6px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #6c7bff;
          display: flex; align-items: center; justify-content: center;
          animation: popIn 0.2s ease;
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* Ambient glows */
        .glow-1 {
          position: fixed; width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(108,123,255,0.09), transparent 70%);
          top: -100px; left: -100px;
          pointer-events: none; filter: blur(60px);
        }
        .glow-2 {
          position: fixed; width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.06), transparent 70%);
          bottom: 0; right: 0;
          pointer-events: none; filter: blur(60px);
        }
      `}</style>

      <div className="glow-1" />
      <div className="glow-2" />

      <div className="settings-wrap">

        {/* Header */}
        <div className="settings-header">
          <div className="settings-icon-box">
            <Palette size={20} color="#fff" />
          </div>
          <div>
            <div className="settings-title">Settings</div>
            <div className="settings-sub">Customise your ChatApp experience</div>
          </div>
        </div>

        {/* Theme section */}
        <div className="section-card">
          <div className="section-label">
            <span>Themes</span>
          </div>

          <div className="themes-grid">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`theme-btn${theme === t ? " active" : ""}`}
                onClick={() => setTheme(t)}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
              >
                {theme === t && (
                  <div className="check-badge">
                    <Check size={9} color="#fff" strokeWidth={3} />
                  </div>
                )}

                <div
                  className="theme-preview"
                  data-theme={t}
                >
                  <div className="theme-swatch" style={{ background: "oklch(var(--p))" }} />
                  <div className="theme-swatch" style={{ background: "oklch(var(--s))" }} />
                  <div className="theme-swatch" style={{ background: "oklch(var(--a))" }} />
                  <div className="theme-swatch" style={{ background: "oklch(var(--n))" }} />
                </div>

                <span className="theme-emoji">{THEME_ICONS[t] ?? "🎨"}</span>
                <span className="theme-name">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;