import { useState, useEffect, useRef } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Type, Image, Shield, ChevronDown, Settings as SettingsIcon, UserX, Info, User, Camera, Bell } from "lucide-react";

const WALLPAPERS = [
  { id: "none", label: "None", style: { background: "var(--fallback-b1,oklch(var(--b1)))" } },
  { id: "dots", label: "Dots", style: { backgroundImage: "radial-gradient(circle, #888 1px, transparent 1px)", backgroundSize: "20px 20px" } },
  { id: "grid", label: "Grid", style: { backgroundImage: "linear-gradient(rgba(128,128,128,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.15) 1px, transparent 1px)", backgroundSize: "24px 24px" } },
  { id: "waves", label: "Waves", style: { backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.1) 10px, rgba(128,128,128,0.1) 20px)" } },
  { id: "bubbles", label: "Bubbles", style: { backgroundImage: "radial-gradient(circle at 20% 50%, rgba(120,119,198,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.15) 0%, transparent 50%)" } },
  { id: "diagonal", label: "Lines", style: { backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(128,128,128,0.08) 5px, rgba(128,128,128,0.08) 6px)" } },
  { id: "gradient1", label: "Sunset", style: { background: "linear-gradient(135deg, rgba(255,154,100,0.2), rgba(208,112,150,0.2))" } },
  { id: "gradient2", label: "Ocean", style: { background: "linear-gradient(135deg, rgba(100,200,255,0.2), rgba(50,100,200,0.2))" } },
  { id: "gradient3", label: "Forest", style: { background: "linear-gradient(135deg, rgba(100,200,100,0.2), rgba(50,150,80,0.2))" } },
];

const FONT_SIZES = [
  { id: "small", label: "Small", size: "13px", preview: "Aa" },
  { id: "medium", label: "Medium", size: "15px", preview: "Aa" },
  { id: "large", label: "Large", size: "18px", preview: "Aa" },
] as const;

// ── Reusable collapsible row ──
const SettingRow = ({
  icon,
  title,
  subtitle,
  isOpen,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="sc">
      <button className="row-trigger" onClick={onClick}>
        <div className="row-left">
          <div className="row-icon">{icon}</div>
          <div>
            <div className="row-title">{title}</div>
            <div className="row-sub">{subtitle}</div>
          </div>
        </div>
        <ChevronDown size={18} className={`row-chevron${isOpen ? " open" : ""}`} />
      </button>
      {isOpen && <div className="row-body">{children}</div>}
    </div>
  );
};

const SettingsPage = () => {
  const { fontSize, setFontSize, wallpaper, setWallpaper } = useThemeStore();
  const { authUser, updatePrivacy, updateProfile, blockedUsersList, fetchBlockedUsers, unblockUser, isLoadingBlocked } = useAuthStore();

  const [lastSeenVisible, setLastSeenVisible] = useState(authUser?.privacy?.lastSeenVisible ?? true);
  const [readReceipts, setReadReceipts] = useState(authUser?.privacy?.readReceipts ?? true);

  // ✅ फिक्स 1: नोटिफिकेशन से जुड़ी स्टेट वेरिएबल्स जोड़े
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === "granted");
  const [notificationSound, setNotificationSound] = useState(true);
  const [notificationPreview, setNotificationPreview] = useState(true);

  // Only one section open at a time
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [editName, setEditName] = useState(authUser?.fullName || "");
  const [editBio, setEditBio] = useState(authUser?.bio || "");
  const [editPic, setEditPic] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditPic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        fullName: editName,
        bio: editBio,
        ...(editPic && { profilePic: editPic }),
      });
      setEditPic(null);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    if (openSection === "blocked") {
      fetchBlockedUsers();
    }
  }, [openSection]);

  const toggleSection = (id: string) => setOpenSection((prev) => (prev === id ? null : id));

  const handlePrivacySave = async () => {
    await updatePrivacy({ lastSeenVisible, readReceipts });
  };

  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0f1a",
      padding: "80px 20px 40px",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        .sw { max-width: 560px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
        .sh { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
        .sib { width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#6c7bff,#818cf8);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(108,123,255,.35);flex-shrink:0; }
        .st { font-size:22px;font-weight:800;color:#e8eaf6;letter-spacing:-.03em; }
        .ss { font-size:13px;color:#636890;margin-top:2px; }
        .sc { background:#1c1e2e;border:1px solid rgba(255,255,255,.06);border-radius:18px;overflow:hidden; }

        /* Collapsible row trigger */
        .row-trigger { width:100%; display:flex; align-items:center; justify-content:space-between; padding:16px 18px; background:transparent; border:none; cursor:pointer; }
        .row-left { display:flex; align-items:center; gap:14px; text-align:left; }
        .row-icon { width:38px;height:38px;border-radius:11px;background:#252740;display:flex;align-items:center;justify-content:center;color:#818cf8;flex-shrink:0; }
        .row-title { font-size:14.5px; font-weight:700; color:#e8eaf6; }
        .row-sub { font-size:12px; color:#636890; margin-top:2px; }
        .row-chevron { color:#636890; transition: transform .2s; flex-shrink:0; }
        .row-chevron.open { transform: rotate(180deg); color:#818cf8; }
        .row-body { padding: 0 18px 20px; border-top: 1px solid rgba(255,255,255,.06); padding-top: 18px; }

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

        .cb { position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:50%;background:#6c7bff;display:flex;align-items:center;justify-content:center; animation: popIn .2s ease; }
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        .glow1 { position:fixed;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(108,123,255,.09),transparent 70%);top:-100px;left:-100px;pointer-events:none;filter:blur(60px); }
        .glow2 { position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(167,139,250,.06),transparent 70%);bottom:0;right:0;pointer-events:none;filter:blur(60px); }
      `}</style>

      <div className="glow1" />
      <div className="glow2" />

      <div className="sw">
        {/* Header */}
        <div className="sh">
          <div className="sib"><SettingsIcon size={20} color="#fff" /></div>
          <div>
            <div className="st">Settings</div>
            <div className="ss">Customise your BlinkTalk experience</div>
          </div>
        </div>

        {/* ── Font Size ── */}
        <SettingRow
          icon={<Type size={18} />}
          title="Font Size"
          subtitle={FONT_SIZES.find((f) => f.id === fontSize)?.label || "Medium"}
          isOpen={openSection === "font"}
          onClick={() => toggleSection("font")}
        >
          <div className="fg">
            {FONT_SIZES.map((f) => (
              <button key={f.id} className={`fb${fontSize === f.id ? " active" : ""}`} onClick={() => setFontSize(f.id)}>
                {fontSize === f.id && <div className="cb" style={{ top: 6, right: 6 }}>✓</div>}
                <span className="fp" style={{ fontSize: f.size }}>{f.preview}</span>
                <span className="fl">{f.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "12px 16px", background: "#252740", borderRadius: 12, color: "#e8eaf6", fontSize: fontSize === "small" ? 13 : fontSize === "large" ? 18 : 15, transition: "font-size .2s" }}>
            Preview: Hey! How are you doing today? 👋
          </div>
        </SettingRow>

        {/* ── Wallpaper ── */}
        <SettingRow
          icon={<Image size={18} />}
          title="Chat Wallpaper"
          subtitle={WALLPAPERS.find((w) => w.id === wallpaper)?.label || "None"}
          isOpen={openSection === "wallpaper"}
          onClick={() => toggleSection("wallpaper")}
        >
          <div className="wg">
            {WALLPAPERS.map((w) => (
              <button key={w.id} className={`wb${wallpaper === w.id ? " active" : ""}`} onClick={() => setWallpaper(w.id)}>
                {wallpaper === w.id && <div className="cb">✓</div>}
                <div className="wp" style={w.style} />
                <span className="wl">{w.label}</span>
              </button>
            ))}
          </div>
        </SettingRow>

        {/* ── Privacy ── */}
        <SettingRow
          icon={<Shield size={18} />}
          title="Privacy"
          subtitle="Last seen, read receipts"
          isOpen={openSection === "privacy"}
          onClick={() => toggleSection("privacy")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#252740", borderRadius: 14 }}>
              <div>
                <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Last Seen</div>
                <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>
                  {lastSeenVisible ? "Everyone can see when you were last online" : "Nobody can see your last seen"}
                </div>
              </div>
              <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={lastSeenVisible}
                  onChange={(e) => setLastSeenVisible(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute", inset: 0, borderRadius: 12, cursor: "pointer",
                  background: lastSeenVisible ? "#6c7bff" : "#3a3c52",
                  transition: "background .2s"
                }}>
                  <span style={{
                    position: "absolute", top: 3, left: lastSeenVisible ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)"
                  }} />
                </span>
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#252740", borderRadius: 14 }}>
              <div>
                <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Read Receipts</div>
                <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>
                  {readReceipts ? "Blue ticks show when messages are read" : "No blue ticks will be sent or received"}
                </div>
              </div>
              <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute", inset: 0, borderRadius: 12, cursor: "pointer",
                  background: readReceipts ? "#6c7bff" : "#3a3c52",
                  transition: "background .2s"
                }}>
                  <span style={{
                    position: "absolute", top: 3, left: readReceipts ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)"
                  }} />
                </span>
              </label>
            </div>

            <button
              onClick={handlePrivacySave}
              style={{ padding: "12px", background: "#6c7bff", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
            >
              Save Privacy Settings
            </button>
          </div>
        </SettingRow>

        {/* ── Blocked Users ── */}
        <SettingRow
          icon={<UserX size={18} />}
          title="Blocked Users"
          subtitle={`${authUser?.blockedUsers?.length || 0} blocked`}
          isOpen={openSection === "blocked"}
          onClick={() => toggleSection("blocked")}
        >
          {isLoadingBlocked ? (
            <div style={{ color: "#636890", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              Loading...
            </div>
          ) : blockedUsersList.length === 0 ? (
            <div style={{ color: "#636890", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              You haven't blocked anyone
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {blockedUsersList.map((u: any) => (
                <div
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#252740",
                    borderRadius: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={u.profilePic || "/avatar.png"}
                      alt={u.fullName}
                      style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                    />
                    <span style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>{u.fullName}</span>
                  </div>
                  <button
                    onClick={() => unblockUser(u._id)}
                    style={{
                      padding: "6px 14px",
                      background: "rgba(239,68,68,0.12)",
                      color: "#ef4444",
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </SettingRow>

        {/* ── Profile Edit ── */}
        <SettingRow
          icon={<User size={18} />}
          title="Edit Profile"
          subtitle={authUser?.fullName || "Update your info"}
          isOpen={openSection === "profile"}
          onClick={() => toggleSection("profile")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <img
                  src={editPic || authUser?.profilePic || "/avatar.png"}
                  alt="profile"
                  style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #6c7bff" }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: "50%",
                    background: "#6c7bff", border: "2px solid #1c1e2e",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <Camera size={13} color="#fff" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePicChange}
                  style={{ display: "none" }}
                />
              </div>
              {editPic && (
                <button
                  onClick={() => setEditPic(null)}
                  style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                >
                  Remove new photo
                </button>
              )}
            </div>

            <div>
              <div style={{ color: "#636890", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                Display Name
              </div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                placeholder="Your name"
                style={{
                  width: "100%", padding: "12px 16px", background: "#252740",
                  border: "1.5px solid rgba(255,255,255,.06)", borderRadius: 12,
                  color: "#e8eaf6", fontSize: 14, outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <div style={{ color: "#636890", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                Bio <span style={{ color: "#3a3c52", textTransform: "none", letterSpacing: 0 }}>({editBio.length}/150)</span>
              </div>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={150}
                placeholder="Write something about yourself..."
                rows={3}
                style={{
                  width: "100%", padding: "12px 16px", background: "#252740",
                  border: "1.5px solid rgba(255,255,255,.06)", borderRadius: 12,
                  color: "#e8eaf6", fontSize: 14, outline: "none", resize: "none",
                  fontFamily: "inherit", boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <div style={{ color: "#636890", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                Email
              </div>
              <div style={{ padding: "12px 16px", background: "#1c1e2e", borderRadius: 12, color: "#636890", fontSize: 14 }}>
                {authUser?.email}
              </div>
            </div>

            <button
              onClick={handleProfileSave}
              disabled={isUpdatingProfile || (!editName.trim())}
              style={{
                padding: "13px", background: isUpdatingProfile ? "#3a3c52" : "#6c7bff",
                color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: "none", cursor: isUpdatingProfile ? "not-allowed" : "pointer",
                transition: "background .2s"
              }}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </SettingRow>

        {/* ── Notifications ── */}
        <SettingRow
          icon={<Bell size={18} />}
          title="Notifications"
          subtitle={notificationsEnabled ? "On" : "Off"}
          isOpen={openSection === "notifications"}
          onClick={() => toggleSection("notifications")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Notification.permission === "default" && (
              <div style={{
                padding: "12px 16px", background: "rgba(108,123,255,0.1)",
                border: "1px solid rgba(108,123,255,0.2)", borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ color: "#818cf8", fontSize: 13, fontWeight: 600 }}>
                  Enable browser notifications?
                </div>
                <button
                  onClick={requestNotificationPermission}
                  style={{
                    padding: "6px 14px", background: "#6c7bff", color: "#fff",
                    borderRadius: 10, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer"
                  }}
                >
                  Allow
                </button>
              </div>
            )}

            {Notification.permission === "denied" && (
              <div style={{
                padding: "12px 16px", background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14,
                color: "#ef4444", fontSize: 12.5
              }}>
                🚫 Browser notifications blocked. Please enable from browser settings.
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#252740", borderRadius: 14 }}>
              <div>
                <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Notifications</div>
                <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>
                  {notificationsEnabled ? "You will receive message alerts" : "All notifications are muted"}
                </div>
              </div>
              <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute", inset: 0, borderRadius: 12, cursor: "pointer",
                  background: notificationsEnabled ? "#6c7bff" : "#3a3c52",
                  transition: "background .2s"
                }}>
                  <span style={{
                    position: "absolute", top: 3, left: notificationsEnabled ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)"
                  }} />
                </span>
              </label>
            </div>

            {notificationsEnabled && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#252740", borderRadius: 14 }}>
                <div>
                  <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Sound</div>
                  <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>
                    {notificationSound ? "Play sound on new message" : "Silent notifications"}
                  </div>
                </div>
                <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={notificationSound}
                    onChange={(e) => setNotificationSound(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute", inset: 0, borderRadius: 12, cursor: "pointer",
                    background: notificationSound ? "#6c7bff" : "#3a3c52",
                    transition: "background .2s"
                }}>
                  <span style={{
                    position: "absolute", top: 3, left: notificationSound ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)"
                  }} />
                </span>
              </label>
            </div>
            )}

            {notificationsEnabled && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#252740", borderRadius: 14 }}>
                <div>
                  <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Message Preview</div>
                  <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>
                    {notificationPreview ? "Show message content in notification" : "Show only 'New message'"}
                  </div>
                </div>
                <label style={{ position: "relative", width: 44, height: 24, flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={notificationPreview}
                    onChange={(e) => setNotificationPreview(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute", inset: 0, borderRadius: 12, cursor: "pointer",
                    background: notificationPreview ? "#6c7bff" : "#3a3c52",
                    transition: "background .2s"
                  }}>
                    <span style={{
                      position: "absolute", top: 3, left: notificationPreview ? 22 : 3,
                      width: 18, height: 18, borderRadius: "50%", background: "#fff",
                      transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)"
                    }} />
                  </span>
                </label>
              </div>
            )}
          </div>
        </SettingRow>

        {/* ── About ── */}
        <SettingRow
          icon={<Info size={18} />}
          title="About"
          subtitle="Version, developer info"
          isOpen={openSection === "about"}
          onClick={() => toggleSection("about")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#252740", borderRadius: 14 }}>
              <div>
                <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>App Version</div>
                <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>BlinkTalk v1.0.0</div>
              </div>
              <span style={{ fontSize: 11, color: "#636890", background: "#1c1e2e", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>Stable</span>
            </div>

            <div style={{ padding: "14px 16px", background: "#252740", borderRadius: 14 }}>
              <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Developer</div>
              <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>Built with g-1 & by BlinkTalk Team</div>
            </div>

            <a 
              href="mailto:support@blinktalk.com"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "#252740", borderRadius: 14,
                textDecoration: "none"
              }}
            >
              <div>
                <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Help & Support</div>
                <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>support@blinktalk.com</div>
              </div>
              <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 600 }}>Email →</span>
            </a>

            <a 
              href="#"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "#252740", borderRadius: 14,
                textDecoration: "none"
              }}
            >
              <div>
                <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Privacy Policy</div>
                <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>How we handle your data</div>
              </div>
              <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 600 }}>View →</span>
            </a>

            <a 
              href="#"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "#252740", borderRadius: 14,
                textDecoration: "none"
              }}
            >
              <div>
                <div style={{ color: "#e8eaf6", fontWeight: 600, fontSize: 14 }}>Terms of Service</div>
                <div style={{ color: "#636890", fontSize: 12, marginTop: 2 }}>Rules and guidelines</div>
              </div>
              <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 600 }}>View →</span>
            </a>

            <div style={{ textAlign: "center", color: "#3a3c52", fontSize: 11.5, padding: "8px 0 4px", fontWeight: 600, letterSpacing: ".04em" }}>
              data is encrypted and secure
            </div>
          </div>
        </SettingRow>
      </div>
    </div>
  );
};


export default SettingsPage;