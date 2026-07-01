import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Users, Plus, Heart, ExternalLink, Loader, UserCheck, LogOut } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const LEVELS   = ["all","school","college","competitive"];
const SUBJECTS = ["all","Maths","Physics","Chemistry","Biology","English","History","Computer","Economics"];
const EXAMS    = ["all","JEE","NEET","UPSC","SSC","GATE","CAT","CUET","Board"];
const MAT_TYPES = ["all","notes","pyq","book","video","other"];

const inp = (extra = {}) => ({
  width:"100%", background:"#f5f6fa", border:"1px solid #e8eaf0",
  borderRadius:10, padding:"10px 12px", fontSize:13, color:"#1a1b2e",
  outline:"none", boxSizing:"border-box" as const, ...extra
});

export default function StudyPage({ onBack }: { onBack: () => void }) {
  const { authUser } = useAuthStore();
  const [tab, setTab]             = useState<"groups" | "materials">("groups");
  const [groups, setGroups]       = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm]   = useState(false);

  // Filters
  const [filterLevel,   setFilterLevel]   = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterExam,    setFilterExam]    = useState("all");
  const [filterType,    setFilterType]    = useState("all");

  // Group form
  const [gForm, setGForm] = useState({ title:"", subject:"", level:"school", exam:"", description:"", maxMembers:"5", city:"", isOnline:false, meetingLink:"", schedule:"", lat:"", lng:"" });

  // Material form
  const [mForm, setMForm] = useState({ title:"", subject:"", level:"school", exam:"", type:"notes", description:"", externalLink:"", class:"" });

  const getGPS = () => new Promise<{lat:number;lng:number}>((res,rej) =>
    navigator.geolocation.getCurrentPosition(p => res({lat:p.coords.latitude,lng:p.coords.longitude}),rej)
  );

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const params: any = { level: filterLevel, subject: filterSubject };
      try { const l = await getGPS(); params.latitude=l.lat; params.longitude=l.lng; } catch {}
      const res = await axiosInstance.get("/study/groups", { params });
      setGroups(res.data);
    } catch { toast.error("Could not load groups"); }
    finally { setIsLoading(false); }
  };

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/study/materials", {
        params: { level:filterLevel, subject:filterSubject, type:filterType, exam:filterExam }
      });
      setMaterials(res.data);
    } catch { toast.error("Could not load materials"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { tab === "groups" ? loadGroups() : loadMaterials(); }, [tab, filterLevel, filterSubject, filterExam, filterType]);

  const handlePostGroup = async () => {
    if (!gForm.title || !gForm.subject) { toast.error("Fill required fields"); return; }
    try {
      await axiosInstance.post("/study/groups", gForm);
      toast.success("Study group created!");
      setShowForm(false);
      loadGroups();
    } catch { toast.error("Failed to create group"); }
  };

  const handlePostMaterial = async () => {
    if (!mForm.title || !mForm.subject) { toast.error("Fill required fields"); return; }
    try {
      await axiosInstance.post("/study/materials", mForm);
      toast.success("Material shared!");
      setShowForm(false);
      loadMaterials();
    } catch { toast.error("Failed to share material"); }
  };

  const handleJoin = async (id: string, isMember: boolean) => {
    try {
      await axiosInstance.put(`/study/groups/${id}/${isMember ? "leave" : "join"}`);
      toast.success(isMember ? "Left group" : "Joined!");
      loadGroups();
    } catch (e: any) { toast.error(e?.response?.data?.message || "Error"); }
  };

  const handleLike = async (id: string) => {
    try {
      await axiosInstance.put(`/study/materials/${id}/like`);
      loadMaterials();
    } catch {}
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f5f6fa", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"14px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#f59e0b" }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#1a1b2e" }}>📚 Study</h2>
          <button onClick={() => setShowForm(true)}
            style={{ marginLeft:"auto", width:36, height:36, borderRadius:10, background:"#f59e0b", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
          >
            <Plus size={18} color="#fff" />
          </button>
        </div>

        {/* Tab toggle */}
        <div style={{ display:"flex", background:"#f5f6fa", borderRadius:12, padding:4 }}>
          {(["groups","materials"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex:1, padding:"8px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
                background: tab===t ? "#fff" : "transparent",
                color: tab===t ? "#f59e0b" : "#9094b0",
                boxShadow: tab===t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}
            >
              {t === "groups" ? "👥 Groups" : "📄 Materials"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ marginTop:10, display:"flex", gap:6, overflowX:"auto" }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setFilterLevel(l)}
              style={{ flexShrink:0, padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
                background: filterLevel===l ? "#f59e0b" : "#f5f6fa",
                color: filterLevel===l ? "#fff" : "#636890" }}
            >
              {l === "all" ? "All" : l.charAt(0).toUpperCase()+l.slice(1)}
            </button>
          ))}
          {tab === "materials" && MAT_TYPES.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ flexShrink:0, padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
                background: filterType===t ? "#8b5cf6" : "#f5f6fa",
                color: filterType===t ? "#fff" : "#636890" }}
            >
              {t === "all" ? "All types" : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {isLoading ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <Loader size={28} color="#f59e0b" style={{ animation:"spin 1s linear infinite", margin:"0 auto" }} />
            <p style={{ color:"#9094b0", fontSize:13, marginTop:12 }}>Loading...</p>
          </div>
        ) : tab === "groups" ? (
          groups.length === 0 ? (
            <div style={{ textAlign:"center", paddingTop:60, color:"#9094b0" }}>
              <Users size={36} style={{ margin:"0 auto 10px", opacity:0.3 }} />
              <p style={{ fontSize:14, fontWeight:600 }}>No study groups found</p>
              <p style={{ fontSize:12, marginTop:4 }}>Create one using + button!</p>
            </div>
          ) : groups.map((g: any) => {
            const isMember = g.members?.some((m: any) => (m._id || m) === authUser?._id);
            const isFull   = g.members?.length >= g.maxMembers;
            return (
              <div key={g._id} style={{ background:"#fff", borderRadius:16, padding:14, marginBottom:10, border:"1px solid #e8eaf0" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:"#f59e0b15", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <BookOpen size={20} color="#f59e0b" />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#1a1b2e" }}>{g.title}</div>
                    <div style={{ fontSize:11, color:"#9094b0", marginTop:2 }}>{g.subject} · {g.level} {g.exam ? `· ${g.exam}` : ""}</div>
                  </div>
                  <span style={{ fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:8, background: g.isOnline ? "#6c7bff15" : "#1db87a15", color: g.isOnline ? "#6c7bff" : "#1db87a" }}>
                    {g.isOnline ? "🌐 Online" : "📍 Offline"}
                  </span>
                </div>

                {g.description && <p style={{ fontSize:12, color:"#636890", marginBottom:8 }}>{g.description}</p>}

                <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:"#636890", display:"flex", alignItems:"center", gap:4 }}>
                    <Users size={11} /> {g.members?.length}/{g.maxMembers} members
                  </span>
                  {g.city && <span style={{ fontSize:11, color:"#636890" }}>📍 {g.city}</span>}
                  {g.schedule && <span style={{ fontSize:11, color:"#636890" }}>🕐 {g.schedule}</span>}
                </div>

                {/* Member avatars */}
                <div style={{ display:"flex", marginBottom:10 }}>
                  {g.members?.slice(0,5).map((m: any, i: number) => (
                    <img key={i} src={m.profilePic || "/avatar.png"}
                      style={{ width:24, height:24, borderRadius:"50%", objectFit:"cover", border:"2px solid #fff", marginLeft: i>0 ? -8 : 0 }}
                    />
                  ))}
                  {g.members?.length > 5 && <span style={{ fontSize:10, color:"#9094b0", marginLeft:4, alignSelf:"center" }}>+{g.members.length-5}</span>}
                </div>

                <div style={{ display:"flex", gap:8, borderTop:"1px solid #f0f0f5", paddingTop:10 }}>
                  {g.isOnline && g.meetingLink && (
                    <a href={g.meetingLink} target="_blank" rel="noreferrer"
                      style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:10, background:"#6c7bff15", color:"#6c7bff", fontSize:12, fontWeight:600, textDecoration:"none" }}
                    >
                      <ExternalLink size={13} /> Join Link
                    </a>
                  )}
                  <button onClick={() => handleJoin(g._id, isMember)} disabled={isFull && !isMember}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:10, border:"none", cursor: isFull && !isMember ? "not-allowed" : "pointer", fontSize:12, fontWeight:600,
                      background: isMember ? "#e83a6b15" : isFull ? "#f5f6fa" : "#f59e0b15",
                      color: isMember ? "#e83a6b" : isFull ? "#9094b0" : "#f59e0b" }}
                  >
                    {isMember ? <><LogOut size={13}/> Leave</> : isFull ? "Full" : <><UserCheck size={13}/> Join</>}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          // Materials
          materials.length === 0 ? (
            <div style={{ textAlign:"center", paddingTop:60, color:"#9094b0" }}>
              <BookOpen size={36} style={{ margin:"0 auto 10px", opacity:0.3 }} />
              <p style={{ fontSize:14, fontWeight:600 }}>No materials found</p>
              <p style={{ fontSize:12, marginTop:4 }}>Share study material using + button!</p>
            </div>
          ) : materials.map((m: any) => {
            const liked = m.likes?.includes(authUser?._id);
            const typeColors: any = { notes:"#6c7bff", pyq:"#e83a6b", book:"#f59e0b", video:"#1db87a", other:"#9094b0" };
            return (
              <div key={m._id} style={{ background:"#fff", borderRadius:16, padding:14, marginBottom:10, border:"1px solid #e8eaf0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <img src={m.userId?.profilePic || "/avatar.png"} style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover" }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#1a1b2e" }}>{m.userId?.fullName}</div>
                    <div style={{ fontSize:10, color:"#9094b0" }}>{new Date(m.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                  </div>
                  <span style={{ fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:8, background:`${typeColors[m.type]}15`, color:typeColors[m.type] }}>
                    {m.type.toUpperCase()}
                  </span>
                </div>

                <h4 style={{ fontWeight:700, fontSize:14, color:"#1a1b2e", marginBottom:4 }}>{m.title}</h4>
                <div style={{ fontSize:11, color:"#9094b0", marginBottom:6 }}>
                  {m.subject} · {m.level} {m.exam ? `· ${m.exam}` : ""} {m.class ? `· Class ${m.class}` : ""}
                </div>
                {m.description && <p style={{ fontSize:12, color:"#636890", marginBottom:10 }}>{m.description}</p>}

                <div style={{ display:"flex", gap:8, paddingTop:8, borderTop:"1px solid #f0f0f5" }}>
                  <button onClick={() => handleLike(m._id)}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                      background: liked ? "#e83a6b15" : "#f5f6fa", color: liked ? "#e83a6b" : "#9094b0" }}
                  >
                    <Heart size={13} fill={liked ? "#e83a6b" : "none"} /> {m.likes?.length || 0}
                  </button>
                  {m.externalLink && (
                    <a href={m.externalLink} target="_blank" rel="noreferrer"
                      style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"7px", borderRadius:10, background:"#f59e0b15", color:"#f59e0b", fontSize:12, fontWeight:600, textDecoration:"none" }}
                    >
                      <ExternalLink size={13} /> Open Resource
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post form */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end" }}
          onClick={() => setShowForm(false)}
        >
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:20, width:"100%", maxHeight:"90vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width:36, height:4, background:"#e8eaf0", borderRadius:4, margin:"0 auto 14px" }} />

            {/* Form tab */}
            <div style={{ display:"flex", background:"#f5f6fa", borderRadius:12, padding:4, marginBottom:16 }}>
              {(["groups","materials"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex:1, padding:"8px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:12,
                    background: tab===t ? "#fff" : "transparent", color: tab===t ? "#f59e0b" : "#9094b0" }}
                >
                  {t === "groups" ? "👥 Create Group" : "📄 Share Material"}
                </button>
              ))}
            </div>

            {tab === "groups" ? (
              <>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Group Title *</label>
                  <input placeholder="e.g. JEE 2025 Physics Group" value={gForm.title} onChange={e => setGForm(f=>({...f,title:e.target.value}))} style={inp()} />
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Subject *</label>
                    <input placeholder="Physics" value={gForm.subject} onChange={e => setGForm(f=>({...f,subject:e.target.value}))} style={inp()} />
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Level *</label>
                    <select value={gForm.level} onChange={e => setGForm(f=>({...f,level:e.target.value}))} style={inp()}>
                      <option value="school">School</option>
                      <option value="college">College</option>
                      <option value="competitive">Competitive</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Exam (if any)</label>
                    <input placeholder="JEE / NEET / UPSC" value={gForm.exam} onChange={e => setGForm(f=>({...f,exam:e.target.value}))} style={inp()} />
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Max Members</label>
                    <input type="number" min="2" max="20" value={gForm.maxMembers} onChange={e => setGForm(f=>({...f,maxMembers:e.target.value}))} style={inp()} />
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Schedule</label>
                  <input placeholder="e.g. Daily 6-8 PM" value={gForm.schedule} onChange={e => setGForm(f=>({...f,schedule:e.target.value}))} style={inp()} />
                </div>
                <div style={{ marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
                  <input type="checkbox" checked={gForm.isOnline} onChange={e => setGForm(f=>({...f,isOnline:e.target.checked}))} id="online" />
                  <label htmlFor="online" style={{ fontSize:13, color:"#1a1b2e", cursor:"pointer" }}>Online group</label>
                </div>
                {gForm.isOnline ? (
                  <div style={{ marginBottom:10 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Meeting link</label>
                    <input placeholder="Google Meet / Zoom link" value={gForm.meetingLink} onChange={e => setGForm(f=>({...f,meetingLink:e.target.value}))} style={inp()} />
                  </div>
                ) : (
                  <div style={{ marginBottom:10 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>City</label>
                    <input placeholder="e.g. Indore" value={gForm.city} onChange={e => setGForm(f=>({...f,city:e.target.value}))} style={inp()} />
                  </div>
                )}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Description</label>
                  <textarea placeholder="What will you study?" value={gForm.description} onChange={e => setGForm(f=>({...f,description:e.target.value}))} rows={2} style={{...inp(), resize:"none" as const}} />
                </div>
                <button onClick={handlePostGroup}
                  style={{ width:"100%", padding:14, borderRadius:12, background:"#f59e0b", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}
                >
                  Create Group
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Title *</label>
                  <input placeholder="e.g. JEE Physics Notes Chapter 1-5" value={mForm.title} onChange={e => setMForm(f=>({...f,title:e.target.value}))} style={inp()} />
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Subject *</label>
                    <input placeholder="Physics" value={mForm.subject} onChange={e => setMForm(f=>({...f,subject:e.target.value}))} style={inp()} />
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Type</label>
                    <select value={mForm.type} onChange={e => setMForm(f=>({...f,type:e.target.value}))} style={inp()}>
                      <option value="notes">Notes</option>
                      <option value="pyq">PYQ</option>
                      <option value="book">Book</option>
                      <option value="video">Video</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Level</label>
                    <select value={mForm.level} onChange={e => setMForm(f=>({...f,level:e.target.value}))} style={inp()}>
                      <option value="school">School</option>
                      <option value="college">College</option>
                      <option value="competitive">Competitive</option>
                    </select>
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Class (if school)</label>
                    <input placeholder="e.g. 10, 12" value={mForm.class} onChange={e => setMForm(f=>({...f,class:e.target.value}))} style={inp()} />
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Exam</label>
                  <input placeholder="JEE / NEET / Board etc" value={mForm.exam} onChange={e => setMForm(f=>({...f,exam:e.target.value}))} style={inp()} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>External Link (Google Drive / YouTube)</label>
                  <input placeholder="https://..." value={mForm.externalLink} onChange={e => setMForm(f=>({...f,externalLink:e.target.value}))} style={inp()} />
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Description</label>
                  <textarea placeholder="What's in this material?" value={mForm.description} onChange={e => setMForm(f=>({...f,description:e.target.value}))} rows={2} style={{...inp(),resize:"none" as const}} />
                </div>
                <button onClick={handlePostMaterial}
                  style={{ width:"100%", padding:14, borderRadius:12, background:"#f59e0b", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}
                >
                  Share Material
                </button>
              </>
            )}
            <button onClick={() => setShowForm(false)}
              style={{ width:"100%", padding:12, marginTop:8, borderRadius:12, background:"transparent", border:"none", color:"#9094b0", fontSize:13, cursor:"pointer" }}
            >Cancel</button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}