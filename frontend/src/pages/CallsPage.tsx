import { useState } from "react";
import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const CallIcon = ({ type }: { type: string }) => {
  if (type === "missed")   return <PhoneMissed  size={13} color="#e83a6b" />;
  if (type === "outgoing") return <PhoneOutgoing size={13} color="#6c7bff" />;
  return <PhoneIncoming size={13} color="#1db87a" />;
};

export default function CallsPage() {
  const [search, setSearch] = useState("");
  const { users } = useChatStore();
  const { startCall } = useCallStore();

  const filtered = users.filter((u: any) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f5f6fa", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"16px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#1a1b2e", marginBottom:12 }}>Calls</h2>
        <div style={{ position:"relative" }}>
          <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9094b0" }} />
          <input
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", background:"#f5f6fa", border:"none", borderRadius:12, padding:"9px 12px 9px 36px", fontSize:13, color:"#1a1b2e", outline:"none", boxSizing:"border-box" }}
          />
        </div>
      </div>

      {/* ✅ Quick call — always visible buttons, no hover needed */}
      {users.length > 0 && (
        <div style={{ background:"#fff", borderBottom:"1px solid #e8eaf0", padding:"12px 20px", flexShrink:0 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#9094b0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
            Quick Call
          </p>
          <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:4 }}>
            {users.slice(0, 6).map((u: any) => (
              <div key={u._id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flexShrink:0 }}>
                {/* Avatar */}
                <img
                  src={u.profilePic || "/avatar.png"}
                  style={{ width:46, height:46, borderRadius:"50%", objectFit:"cover", border:"2px solid #e8eaf0" }}
                />
                <span style={{ fontSize:10, color:"#636890", fontWeight:500 }}>
                  {u.fullName.split(" ")[0]}
                </span>
                {/* ✅ Always visible call buttons below avatar */}
                <div style={{ display:"flex", gap:6 }}>
                  <button
                    onClick={() => startCall(u, "audio")}
                    title="Voice call"
                    style={{ width:28, height:28, borderRadius:"50%", background:"#1db87a", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
                  >
                    <Phone size={12} color="#fff" />
                  </button>
                  <button
                    onClick={() => startCall(u, "video")}
                    title="Video call"
                    style={{ width:28, height:28, borderRadius:"50%", background:"#6c7bff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
                  >
                    <Video size={12} color="#fff" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Contact list with real call buttons */}
      <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
        <p style={{ fontSize:10, fontWeight:700, color:"#9094b0", textTransform:"uppercase", letterSpacing:"0.08em", padding:"8px 20px" }}>
          Contacts
        </p>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", paddingTop:40, color:"#9094b0" }}>
            <Phone size={32} style={{ margin:"0 auto 8px", opacity:0.3 }} />
            <p style={{ fontSize:13 }}>No contacts found</p>
          </div>
        )}

        {filtered.map((u: any) => (
          <div
            key={u._id}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px", background:"#fff", marginBottom:1 }}
          >
            {/* Avatar */}
            <img
              src={u.profilePic || "/avatar.png"}
              style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:"2px solid #e8eaf0", flexShrink:0 }}
            />

            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:14, color:"#1a1b2e" }}>{u.fullName}</div>
              <div style={{ fontSize:11, color:"#9094b0", marginTop:2 }}>{u.email}</div>
            </div>

            {/* ✅ Real clickable call buttons with onClick */}
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => startCall(u, "audio")}
                title="Voice call"
                style={{ width:38, height:38, borderRadius:"50%", border:"none", background:"#1db87a15", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#1db87a" }}
              >
                <Phone size={17} />
              </button>
              <button
                onClick={() => startCall(u, "video")}
                title="Video call"
                style={{ width:38, height:38, borderRadius:"50%", border:"none", background:"#6c7bff15", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#6c7bff" }}
              >
                <Video size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}