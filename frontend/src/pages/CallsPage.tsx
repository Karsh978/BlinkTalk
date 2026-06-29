import { useState } from "react";
import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

// Dummy call history — baad mein backend se aayega
const MOCK_CALLS = [
  { id:1, name:"Aryan",  pic:"", type:"incoming", callType:"audio", time:"Today, 10:32 AM",  duration:"5 min",  missed:false },
  { id:2, name:"Priya",  pic:"", type:"missed",   callType:"audio", time:"Today, 9:15 AM",   duration:"",       missed:true  },
  { id:3, name:"Rahul",  pic:"", type:"outgoing", callType:"video", time:"Yesterday, 7:00 PM",duration:"12 min", missed:false },
  { id:4, name:"Sahil",  pic:"", type:"incoming", callType:"video", time:"Yesterday, 2:10 PM",duration:"3 min",  missed:false },
  { id:5, name:"Aryan",  pic:"", type:"missed",   callType:"video", time:"Mon, 11:45 AM",    duration:"",       missed:true  },
];

const CallIcon = ({ type, callType }: any) => {
  if (type === "missed")   return <PhoneMissed  size={14} color="#e83a6b" />;
  if (type === "outgoing") return <PhoneOutgoing size={14} color="#6c7bff" />;
  return <PhoneIncoming size={14} color="#1db87a" />;
};

export default function CallsPage() {
  const [search, setSearch] = useState("");
  const { users } = useChatStore();
  const { startCall } = useCallStore();

  const filtered = MOCK_CALLS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f5f6fa", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"16px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#1a1b2e", marginBottom:12 }}>Calls</h2>
        <div style={{ position:"relative" }}>
          <Search size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9094b0" }} />
          <input
            placeholder="Search calls..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", background:"#f5f6fa", border:"none", borderRadius:12, padding:"9px 12px 9px 36px", fontSize:13, color:"#1a1b2e", outline:"none", boxSizing:"border-box" }}
          />
        </div>
      </div>

      {/* Quick call — contacts */}
      {users.length > 0 && (
        <div style={{ background:"#fff", borderBottom:"1px solid #e8eaf0", padding:"12px 20px", flexShrink:0 }}>
          <p style={{ fontSize:10, fontWeight:700, color:"#9094b0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Quick call</p>
          <div style={{ display:"flex", gap:16, overflowX:"auto", paddingBottom:4 }}>
            {users.slice(0,6).map((u: any) => (
              <div key={u._id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flexShrink:0 }}>
                <div style={{ position:"relative" }}>
                  <img src={u.profilePic || "/avatar.png"} style={{ width:46, height:46, borderRadius:"50%", objectFit:"cover", border:"2px solid #e8eaf0" }} />
                  {/* Call buttons overlay */}
                  <div style={{ position:"absolute", inset:0, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", gap:2, background:"rgba(0,0,0,0.35)", opacity:0 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity="1"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity="0"}
                  >
                    <button onClick={() => startCall(u,"audio")} style={{ background:"#1db87a", border:"none", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                      <Phone size={10} color="#fff" />
                    </button>
                    <button onClick={() => startCall(u,"video")} style={{ background:"#6c7bff", border:"none", borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                      <Video size={10} color="#fff" />
                    </button>
                  </div>
                </div>
                <span style={{ fontSize:10, color:"#636890", fontWeight:500 }}>{u.fullName.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call history */}
      <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
        <p style={{ fontSize:10, fontWeight:700, color:"#9094b0", textTransform:"uppercase", letterSpacing:"0.08em", padding:"8px 20px" }}>Recent</p>
        {filtered.map(call => (
          <div key={call.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 20px", cursor:"pointer", transition:"background .1s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#f5f6fa"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}
          >
            {/* Avatar */}
            <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ color:"#fff", fontWeight:700, fontSize:16 }}>{call.name[0]}</span>
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:14, color: call.missed ? "#e83a6b" : "#1a1b2e" }}>{call.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <CallIcon type={call.type} callType={call.callType} />
                <span style={{ fontSize:11, color:"#9094b0" }}>{call.time}</span>
                {call.duration && <span style={{ fontSize:11, color:"#9094b0" }}>· {call.duration}</span>}
              </div>
            </div>

            {/* Call back buttons */}
            <div style={{ display:"flex", gap:8 }}>
              <button
                title="Voice call"
                style={{ width:36, height:36, borderRadius:"50%", border:"1px solid #e8eaf0", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#1db87a" }}
              >
                <Phone size={16} />
              </button>
              {call.callType === "video" && (
                <button
                  title="Video call"
                  style={{ width:36, height:36, borderRadius:"50%", border:"1px solid #e8eaf0", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#6c7bff" }}
                >
                  <Video size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}