import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Phone, LifeBuoy, Sparkles, Settings, LogOut, User } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import SettingsPage from "../pages/SettingsPage";
import CallsPage from "../pages/CallsPage";
import HelperPage from "../pages/HelperPage";
import AIPage from "../pages/AIPage";

type Tab = "chat" | "calls" | "helper" | "ai" | "settings";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const { authUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const isChatActive = !!(selectedUser || selectedGroup);

  const tabs = [
    { id: "chat",     label: "Chat",     Icon: MessageSquare },
    { id: "calls",    label: "Calls",    Icon: Phone         },
    { id: "helper",   label: "Helper",   Icon: LifeBuoy      },
    { id: "ai",       label: "AI",       Icon: Sparkles      },
    { id: "settings", label: "Settings", Icon: Settings      },
  ] as const;

  return (
    <div style={{ height:"100vh", width:"100%", display:"flex", flexDirection:"column", overflow:"hidden", background:"#f5f6fa" }}>

      {/* ── TOP BAR (desktop only) ── */}
      <div style={{
        height: 56, background:"#fff", borderBottom:"1px solid #e8eaf0",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 20px", flexShrink:0,
      }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <MessageSquare size={18} color="#fff" />
          </div>
          <span style={{ fontWeight:800, fontSize:18, color:"#1a1b2e", letterSpacing:"-0.02em" }}>BlinkTalk</span>
        </div>

        {/* Desktop tab buttons */}
        <div style={{ display:"flex", gap:4 }}>
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer",
                background: activeTab === id ? "#6c7bff15" : "transparent",
                color: activeTab === id ? "#6c7bff" : "#636890",
                fontWeight: activeTab === id ? 700 : 500,
                fontSize: 13, transition:"all .15s",
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* User actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <img
            src={authUser?.profilePic || "/avatar.png"}
            style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:"2px solid #e8eaf0" }}
          />
          <span style={{ fontSize:13, fontWeight:600, color:"#1a1b2e" }}>{authUser?.fullName}</span>
          <button
            onClick={logout}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 12px", borderRadius:8, border:"1px solid #e8eaf0", background:"transparent", color:"#636890", fontSize:12, cursor:"pointer" }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Chat tab */}
        {activeTab === "chat" && (
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

            {/* Sidebar */}
            <div style={{
              width: 360, flexShrink:0, borderRight:"1px solid #e8eaf0",
              display: isChatActive ? "none" : "flex",
              flexDirection:"column", height:"100%",
            }} className="md:flex!">
              <div style={{ display:"flex", flexDirection:"column", height:"100%" }} className="md:block" id="sidebar-wrap">
                <Sidebar />
              </div>
            </div>

            {/* Sidebar always visible on md+ */}
            <style>{`
              @media(min-width:768px){
                #sidebar-wrap-mobile{display:none!important}
                #sidebar-always{display:flex!important}
              }
            `}</style>

            {/* Chat area */}
            <div style={{
              flex:1, display:"flex", flexDirection:"column", overflow:"hidden",
              background:"#fff",
            }}>
              {isChatActive ? <ChatContainer /> : <NoChatSelected />}
            </div>
          </div>
        )}

        {/* Calls tab */}
        {activeTab === "calls" && <CallsPage />}

        {/* Helper tab */}
        {activeTab === "helper" && <HelperPage />}

        {/* AI tab */}
        {activeTab === "ai" && <AIPage />}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div style={{ flex:1, overflowY:"auto" }}>
            <SettingsPage />
          </div>
        )}
      </div>

      {/* ── BOTTOM NAVBAR (mobile only) ── */}
      <div style={{
        height: 60, background:"#fff", borderTop:"1px solid #e8eaf0",
        display:"flex", alignItems:"center", flexShrink:0,
      }} className="md:hidden">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:3,
              border:"none", background:"transparent", cursor:"pointer",
              color: activeTab === id ? "#6c7bff" : "#9094b0",
              padding:"6px 0",
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize:9, fontWeight: activeTab === id ? 700 : 500 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;