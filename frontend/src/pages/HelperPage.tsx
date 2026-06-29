import { useState } from "react";
import { ArrowLeft, Plus, Phone, MessageSquare, Share2, Search } from "lucide-react";

const CATEGORIES = [
  { id:"blood",  label:"Blood donor",  icon:"🩸", color:"#e83a6b", bg:"#e83a6b15", count:12 },
  { id:"ride",   label:"Ride",         icon:"🚗", color:"#6c7bff", bg:"#6c7bff15", count:8  },
  { id:"study",  label:"Study",        icon:"📚", color:"#f59e0b", bg:"#f59e0b15", count:5  },
  { id:"job",    label:"Job",          icon:"💼", color:"#1db87a", bg:"#1db87a15", count:24 },
  { id:"repair", label:"Repair",       icon:"🔧", color:"#8b5cf6", bg:"#8b5cf615", count:7  },
  { id:"lost",   label:"Lost & found", icon:"📍", color:"#06b6d4", bg:"#06b6d415", count:3  },
  { id:"fund",   label:"Fund",         icon:"💰", color:"#f97316", bg:"#f9731615", count:6  },
  { id:"daily",  label:"Daily help",   icon:"🤝", color:"#ec4899", bg:"#ec489915", count:15 },
];

const MOCK_POSTS: Record<string, any[]> = {
  blood:  [{ id:1, name:"Rahul",  text:"Need B+ blood urgently at City Hospital. Please help.", time:"2 min ago",  dist:"0.5 km", urgent:true  },
           { id:2, name:"Suresh", text:"Looking for O- blood donor. Apollo Hospital. Contact now.", time:"1 hr ago",  dist:"2.1 km", urgent:true  }],
  ride:   [{ id:3, name:"Priya",  text:"Ride needed from Indore to Bhopal tomorrow 6am. Share cost.", time:"10 min ago", dist:"1.2 km", urgent:false }],
  study:  [{ id:4, name:"Aryan",  text:"Looking for JEE 2025 study partner. Physics and Maths.", time:"30 min ago", dist:"0.8 km", urgent:false }],
  job:    [{ id:5, name:"StartupCo", text:"Hiring delivery boys. Part time ok. 15k/month.", time:"1 hr ago",  dist:"3 km",   urgent:false }],
  repair: [{ id:6, name:"Mohan",  text:"Need AC repair at home today. Sahil colony.", time:"2 hr ago",  dist:"1.5 km", urgent:false }],
  lost:   [{ id:7, name:"Neha",   text:"Lost black wallet near City Mall yesterday. Has cards. Reward.", time:"5 hr ago",  dist:"0.3 km", urgent:false }],
  fund:   [{ id:8, name:"Ravi",   text:"Sister needs surgery. Raising funds. Any amount helps.", time:"1 day ago", dist:"4 km",   urgent:false }],
  daily:  [{ id:9, name:"Mrs. Sharma", text:"Need grocery help for elderly parents. Will pay fairly.", time:"3 hr ago",  dist:"0.6 km", urgent:false }],
};

export default function HelperPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch]     = useState("");

  const cat = CATEGORIES.find(c => c.id === selected);
  const posts = selected ? (MOCK_POSTS[selected] || []) : [];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f5f6fa", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"14px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: selected ? 0 : 12 }}>
          {selected && (
            <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6c7bff", display:"flex", padding:0 }}>
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 style={{ fontSize:18, fontWeight:800, color:"#1a1b2e" }}>
            {selected ? `${cat?.icon} ${cat?.label}` : "Helper"}
          </h2>
          {selected && (
            <button style={{ marginLeft:"auto", width:36, height:36, borderRadius:10, background:"#6c7bff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Plus size={18} color="#fff" />
            </button>
          )}
        </div>

        {!selected && (
          <div style={{ position:"relative" }}>
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9094b0" }} />
            <input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", background:"#f5f6fa", border:"none", borderRadius:12, padding:"8px 12px 8px 34px", fontSize:13, outline:"none", boxSizing:"border-box" }}
            />
          </div>
        )}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {!selected ? (
          <>
            {/* Banner */}
            <div style={{ background:"#6c7bff", borderRadius:16, padding:"16px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:28 }}>🤝</span>
              <div>
                <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Community Help</div>
                <div style={{ color:"#ffffff99", fontSize:11, marginTop:2 }}>Connect with people nearby</div>
              </div>
            </div>

            {/* Category grid */}
            <p style={{ fontSize:10, fontWeight:700, color:"#9094b0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Categories</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {CATEGORIES.filter(c => c.label.toLowerCase().includes(search.toLowerCase())).map(c => (
                <button key={c.id} onClick={() => setSelected(c.id)}
                  style={{ background:"#fff", border:"1px solid #e8eaf0", borderRadius:14, padding:"14px 12px", cursor:"pointer", display:"flex", flexDirection:"column", gap:8, textAlign:"left", transition:"border-color .15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor=c.color}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor="#e8eaf0"}
                >
                  <div style={{ width:38, height:38, borderRadius:10, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:12, color:"#1a1b2e" }}>{c.label}</div>
                    <div style={{ fontSize:10, color:"#9094b0", marginTop:1 }}>{c.count} requests</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Recent nearby */}
            <p style={{ fontSize:10, fontWeight:700, color:"#9094b0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Recent near you</p>
            {Object.values(MOCK_POSTS).flat().slice(0,3).map((p:any) => (
              <div key={p.id} style={{ background:"#fff", borderRadius:12, padding:"12px", marginBottom:8, border:"1px solid #e8eaf0", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>{p.name[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:12, color:"#1a1b2e", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.text}</div>
                  <div style={{ fontSize:10, color:"#9094b0", marginTop:2 }}>{p.name} · {p.dist}</div>
                </div>
                {p.urgent && <span style={{ fontSize:9, fontWeight:700, background:"#e83a6b15", color:"#e83a6b", borderRadius:6, padding:"2px 7px", flexShrink:0 }}>Urgent</span>}
              </div>
            ))}
          </>
        ) : (
          // Posts list
          posts.length === 0 ? (
            <div style={{ textAlign:"center", paddingTop:60, color:"#9094b0" }}>
              <p style={{ fontSize:32, marginBottom:8 }}>{cat?.icon}</p>
              <p style={{ fontSize:14, fontWeight:600 }}>No requests yet</p>
              <p style={{ fontSize:12, marginTop:4 }}>Be the first to post!</p>
            </div>
          ) : (
            posts.map(p => (
              <div key={p.id} style={{ background:"#fff", borderRadius:16, padding:"14px", marginBottom:12, border:"1px solid #e8eaf0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13 }}>{p.name[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:"#1a1b2e" }}>{p.name}</div>
                    <div style={{ fontSize:10, color:"#9094b0" }}>{p.time} · {p.dist}</div>
                  </div>
                  {p.urgent && <span style={{ fontSize:9, fontWeight:700, background:"#e83a6b15", color:"#e83a6b", borderRadius:6, padding:"2px 7px" }}>Urgent</span>}
                </div>
                <p style={{ fontSize:13, color:"#636890", lineHeight:1.5, marginBottom:10 }}>{p.text}</p>
                <div style={{ display:"flex", gap:8, borderTop:"1px solid #f0f0f5", paddingTop:10 }}>
                  {[{Icon:Phone, label:"Call", color:"#1db87a"},{Icon:MessageSquare, label:"Message", color:"#6c7bff"},{Icon:Share2, label:"Share", color:"#9094b0"}].map(({Icon, label, color}) => (
                    <button key={label} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5, padding:"7px", borderRadius:8, border:"1px solid #e8eaf0", background:"transparent", cursor:"pointer", fontSize:11, color, fontWeight:500 }}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}