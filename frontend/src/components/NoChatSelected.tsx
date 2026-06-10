const NoChatSelected = () => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f7fb",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(-4deg); }
          50%      { transform: translateY(-12px) rotate(-4deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(3deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-14px) rotate(-2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.65); opacity: 0; }
        }

        .nc-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          animation: fadeUp 0.5s ease both;
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 380px;
          padding: 0 24px;
        }

        /* ── Pulsing icon ring ── */
        .nc-icon-ring {
          position: relative;
          width: 96px; height: 96px;
          margin-bottom: 28px;
        }
        .nc-icon-ring::before,
        .nc-icon-ring::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(108,99,255,0.3);
          animation: pulse-ring 2.4s ease-out infinite;
        }
        .nc-icon-ring::after { animation-delay: 1.2s; }

        .nc-icon-circle {
          width: 96px; height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ede9ff, #ffffff);
          border: 2px solid rgba(108,99,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 42px;
          box-shadow: 0 8px 32px rgba(108,99,255,0.15), 0 0 0 1px rgba(108,99,255,0.08);
          position: relative;
          z-index: 1;
        }

        /* ── Title ── */
        .nc-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #1a1a2e 30%, #6c63ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }

        /* ── Subtitle ── */
        .nc-sub {
          font-size: 14px;
          color: #8b8fa8;
          line-height: 1.65;
          margin-bottom: 28px;
        }

        /* ── Feature pills ── */
        .nc-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 28px;
        }
        .nc-pill {
          background: #ede9ff;
          border: 1px solid rgba(108,99,255,0.18);
          color: #6c63ff;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 13px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }

        /* ── CTA hint ── */
        .nc-cta {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #ebebf5;
          border-radius: 14px;
          padding: 14px 20px;
          color: #8b8fa8;
          font-size: 13px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .nc-arrow {
          animation: floatB 2s ease-in-out infinite;
          font-size: 18px;
          flex-shrink: 0;
        }

        /* ── Floating bubble decorations ── */
        .nc-bubble {
          position: absolute;
          border-radius: 18px;
          pointer-events: none;
        }
        .nb1 {
          width: 140px; height: 44px;
          background: linear-gradient(135deg, rgba(108,99,255,0.08), rgba(167,139,250,0.08));
          border: 1px solid rgba(108,99,255,0.1);
          top: 22%; left: 12%;
          animation: floatA 4s ease-in-out infinite;
        }
        .nb2 {
          width: 100px; height: 36px;
          background: rgba(108,99,255,0.06);
          border: 1px solid rgba(108,99,255,0.08);
          top: 30%; left: 8%;
          border-radius: 18px 18px 18px 4px;
          animation: floatB 5s ease-in-out infinite;
        }
        .nb3 {
          width: 120px; height: 40px;
          background: linear-gradient(135deg, rgba(108,99,255,0.08), rgba(167,139,250,0.06));
          border: 1px solid rgba(108,99,255,0.1);
          top: 20%; right: 10%;
          border-radius: 18px 18px 4px 18px;
          animation: floatC 4.5s ease-in-out infinite;
        }
        .nb4 {
          width: 80px; height: 30px;
          background: rgba(108,99,255,0.05);
          border: 1px solid rgba(108,99,255,0.08);
          top: 30%; right: 14%;
          animation: floatA 3.8s ease-in-out infinite;
        }
        .nb5 {
          width: 160px; height: 48px;
          background: rgba(108,99,255,0.06);
          border: 1px solid rgba(108,99,255,0.08);
          bottom: 25%; left: 8%;
          animation: floatC 5.2s ease-in-out infinite;
        }
        .nb6 {
          width: 110px; height: 38px;
          background: linear-gradient(135deg, rgba(108,99,255,0.08), rgba(167,139,250,0.06));
          border: 1px solid rgba(108,99,255,0.1);
          bottom: 20%; right: 9%;
          border-radius: 18px 18px 4px 18px;
          animation: floatB 4.2s ease-in-out infinite;
        }

        /* ── Dot grid background ── */
        .nc-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(108,99,255,0.1) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .nc-dot-fade {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 25%, #f6f7fb 75%);
          pointer-events: none;
        }
      `}</style>

      {/* Background */}
      <div className="nc-dot-grid" />
      <div className="nc-dot-fade" />

      {/* Floating bubble decorations */}
      <div className="nc-bubble nb1" />
      <div className="nc-bubble nb2" />
      <div className="nc-bubble nb3" />
      <div className="nc-bubble nb4" />
      <div className="nc-bubble nb5" />
      <div className="nc-bubble nb6" />

      {/* Center card */}
      <div className="nc-card">
        <div className="nc-icon-ring">
          <div className="nc-icon-circle">💬</div>
        </div>

        <div className="nc-title">Welcome to ChatApp</div>
        <div className="nc-sub">
          Your messages are end-to-end encrypted.<br />
          Pick a conversation to get started.
        </div>

        <div className="nc-pills">
          <span className="nc-pill">🔒 Encrypted</span>
          <span className="nc-pill">⚡ Real-time</span>
          <span className="nc-pill">📎 File sharing</span>
        </div>

        <div className="nc-cta">
          <span className="nc-arrow">👈</span>
          <span>Select a conversation from the sidebar to start chatting</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;