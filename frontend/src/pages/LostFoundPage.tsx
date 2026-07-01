import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, MapPin, Phone, Search, Loader, CheckCircle, Trash2, Camera, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const CATEGORIES = ["all","wallet","phone","keys","bag","jewellery","documents","pet","vehicle","other"];
const inp = (extra = {}) => ({
  width:"100%", background:"#f5f6fa", border:"1px solid #e8eaf0",
  borderRadius:10, padding:"10px 12px", fontSize:13, color:"#1a1b2e",
  outline:"none", boxSizing:"border-box" as const, ...extra
});

export default function LostFoundPage({ onBack }: { onBack: () => void }) {
  const { authUser } = useAuthStore();
  const [posts, setPosts]         = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [filterType, setFilterType]         = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [myLocation, setMyLocation]         = useState<{lat:number;lng:number}|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    type: "lost" as "lost"|"found",
    title: "", description: "", image: "",
    category: "other", area: "", city: "",
    date: new Date().toISOString().split("T")[0],
    reward: "", contact: "",
    lat: "", lng: "",
  });
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [isPosting, setIsPosting]       = useState(false);

  const getGPS = () => new Promise<{lat:number;lng:number}>((res,rej) =>
    navigator.geolocation.getCurrentPosition(p => res({lat:p.coords.latitude,lng:p.coords.longitude}),rej)
  );

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filterType     !== "all") params.type     = filterType;
      if (filterCategory !== "all") params.category = filterCategory;
      try {
        const loc = await getGPS();
        setMyLocation(loc);
        params.latitude  = loc.lat;
        params.longitude = loc.lng;
      } catch {}
      const res = await axiosInstance.get("/lostfound", { params });
      setPosts(res.data);
    } catch { toast.error("Could not load posts"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadPosts(); }, [filterType, filterCategory]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setForm(f => ({...f, image: base64}));
    };
    reader.readAsDataURL(file);
  };

  const detectLocation = async () => {
    try {
      const loc = await getGPS();
      setForm(f => ({...f, lat: String(loc.lat), lng: String(loc.lng)}));
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`);
      const data = await res.json();
      const area = data.address?.suburb || data.address?.neighbourhood || "";
      const city = data.address?.city   || data.address?.town          || "";
      setForm(f => ({...f, area, city}));
      toast.success(`Location: ${area} ${city}`);
    } catch { toast.error("GPS access denied"); }
  };

  const handlePost = async () => {
    if (!form.title || !form.description) { toast.error("Fill required fields"); return; }
    setIsPosting(true);
    try {
      await axiosInstance.post("/lostfound", form);
      toast.success("Post created!");
      setShowForm(false);
      setImagePreview(null);
      setForm({ type:"lost", title:"", description:"", image:"", category:"other", area:"", city:"", date:new Date().toISOString().split("T")[0], reward:"", contact:"", lat:"", lng:"" });
      loadPosts();
    } catch { toast.error("Failed to post"); }
    finally { setIsPosting(false); }
  };

  const handleResolve = async (id: string) => {
    try {
      await axiosInstance.put(`/lostfound/${id}/resolve`);
      toast.success("Marked as resolved! 🎉");
      loadPosts();
    } catch { toast.error("Error"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/lostfound/${id}`);
      toast.success("Post deleted");
      loadPosts();
    } catch { toast.error("Error"); }
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f5f6fa", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"14px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#06b6d4" }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#1a1b2e" }}>📍 Lost & Found</h2>
          <button onClick={() => setShowForm(true)}
            style={{ marginLeft:"auto", width:36, height:36, borderRadius:10, background:"#06b6d4", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
          >
            <Plus size={18} color="#fff" />
          </button>
        </div>

        {/* Lost / Found filter */}
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          {["all","lost","found"].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ padding:"6px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
                background: filterType===t ? (t==="lost"?"#e83a6b": t==="found"?"#1db87a":"#06b6d4") : "#f5f6fa",
                color: filterType===t ? "#fff" : "#636890" }}
            >
              {t === "all" ? "All" : t === "lost" ? "😔 Lost" : "🎉 Found"}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div style={{ display:"flex", gap:6, overflowX:"auto" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCategory(c)}
              style={{ flexShrink:0, padding:"5px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:600,
                background: filterCategory===c ? "#06b6d4" : "#f5f6fa",
                color: filterCategory===c ? "#fff" : "#636890" }}
            >
              {c.charAt(0).toUpperCase()+c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {isLoading ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <Loader size={28} color="#06b6d4" style={{ animation:"spin 1s linear infinite", margin:"0 auto" }} />
            <p style={{ color:"#9094b0", fontSize:13, marginTop:12 }}>Searching nearby...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign:"center", paddingTop:60, color:"#9094b0" }}>
            <MapPin size={36} style={{ margin:"0 auto 10px", opacity:0.3 }} />
            <p style={{ fontSize:14, fontWeight:600 }}>No posts found nearby</p>
            <p style={{ fontSize:12, marginTop:4 }}>Post using + button!</p>
          </div>
        ) : posts.map((p: any) => {
          const isOwner = p.userId?._id === authUser?._id;
          return (
            <div key={p._id} style={{ background:"#fff", borderRadius:16, marginBottom:12, border:"1px solid #e8eaf0", overflow:"hidden" }}>

              {/* Photo */}
              {p.image && (
                <img src={p.image} style={{ width:"100%", height:180, objectFit:"cover" }} />
              )}

              <div style={{ padding:14 }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <img src={p.userId?.profilePic||"/avatar.png"} style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#1a1b2e" }}>{p.userId?.fullName}</div>
                    <div style={{ fontSize:10, color:"#9094b0" }}>
                      {new Date(p.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      {p.distanceKm != null && ` · ${p.distanceKm} km away`}
                    </div>
                  </div>
                  {/* Lost/Found badge */}
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:8,
                    background: p.type==="lost" ? "#e83a6b15" : "#1db87a15",
                    color: p.type==="lost" ? "#e83a6b" : "#1db87a" }}>
                    {p.type === "lost" ? "😔 Lost" : "🎉 Found"}
                  </span>
                </div>

                <h4 style={{ fontWeight:800, fontSize:15, color:"#1a1b2e", marginBottom:4 }}>{p.title}</h4>

                <div style={{ display:"flex", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:6, background:"#06b6d415", color:"#06b6d4" }}>
                    {p.category}
                  </span>
                  {(p.area || p.city) && (
                    <span style={{ fontSize:10, color:"#9094b0", display:"flex", alignItems:"center", gap:3 }}>
                      <MapPin size={10} /> {[p.area, p.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {p.reward > 0 && (
                    <span style={{ fontSize:10, fontWeight:700, color:"#f59e0b" }}>🎁 ₹{p.reward} reward</span>
                  )}
                </div>

                <p style={{ fontSize:13, color:"#636890", lineHeight:1.5, marginBottom:10 }}>{p.description}</p>

                {/* Actions */}
                <div style={{ display:"flex", gap:8, borderTop:"1px solid #f0f0f5", paddingTop:10 }}>
                  {p.userId?.phoneNumber && (
                    <a href={`tel:${p.userId.phoneNumber}`}
                      style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:10, background:"#1db87a15", color:"#1db87a", fontSize:12, fontWeight:600, textDecoration:"none" }}
                    >
                      <Phone size={13} /> Call
                    </a>
                  )}
                  {isOwner && (
                    <>
                      <button onClick={() => handleResolve(p._id)}
                        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:10, border:"none", cursor:"pointer", background:"#06b6d415", color:"#06b6d4", fontSize:12, fontWeight:600 }}
                      >
                        <CheckCircle size={13} /> Resolved
                      </button>
                      <button onClick={() => handleDelete(p._id)}
                        style={{ width:36, display:"flex", alignItems:"center", justifyContent:"center", padding:"8px", borderRadius:10, border:"none", cursor:"pointer", background:"#e83a6b15", color:"#e83a6b" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Form */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end" }}
          onClick={() => setShowForm(false)}
        >
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:20, width:"100%", maxHeight:"92vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width:36, height:4, background:"#e8eaf0", borderRadius:4, margin:"0 auto 14px" }} />
            <h3 style={{ fontWeight:800, fontSize:16, color:"#1a1b2e", marginBottom:14 }}>Post Lost / Found</h3>

            {/* Lost / Found toggle */}
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {(["lost","found"] as const).map(t => (
                <button key={t} onClick={() => setForm(f=>({...f,type:t}))}
                  style={{ flex:1, padding:"10px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
                    background: form.type===t ? (t==="lost"?"#e83a6b":"#1db87a") : "#f5f6fa",
                    color: form.type===t ? "#fff" : "#636890" }}
                >
                  {t === "lost" ? "😔 I Lost Something" : "🎉 I Found Something"}
                </button>
              ))}
            </div>

            {/* Photo upload */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} style={{ display:"none" }} />
            {imagePreview ? (
              <div style={{ position:"relative", marginBottom:12 }}>
                <img src={imagePreview} style={{ width:"100%", height:160, objectFit:"cover", borderRadius:12 }} />
                <button onClick={() => { setImagePreview(null); setForm(f=>({...f,image:""})); }}
                  style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:"50%", background:"#e83a6b", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
                >
                  <X size={14} color="#fff" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                style={{ width:"100%", height:120, border:"2px dashed #e8eaf0", borderRadius:12, background:"#f5f6fa", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", marginBottom:12 }}
              >
                <Camera size={24} color="#9094b0" />
                <span style={{ fontSize:12, color:"#9094b0" }}>Add photo of item</span>
              </button>
            )}

            {/* Title */}
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Item Name *</label>
              <input placeholder="e.g. Black wallet, iPhone 13, Keys" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} style={inp()} />
            </div>

            {/* Category and Date */}
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Category</label>
                <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={inp()}>
                  {CATEGORIES.filter(c=>c!=="all").map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} style={inp()} />
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>
                Location *
                <button onClick={detectLocation} style={{ marginLeft:8, fontSize:10, color:"#06b6d4", background:"none", border:"none", cursor:"pointer", fontWeight:700 }}>
                  📍 Detect GPS
                </button>
              </label>
              <div style={{ display:"flex", gap:8 }}>
                <input placeholder="Area / Locality" value={form.area} onChange={e => setForm(f=>({...f,area:e.target.value}))} style={{...inp(), flex:1}} />
                <input placeholder="City" value={form.city} onChange={e => setForm(f=>({...f,city:e.target.value}))} style={{...inp(), flex:1}} />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Description *</label>
              <textarea placeholder="Describe the item in detail — color, brand, any marks..." value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={3} style={{...inp(), resize:"none" as const}} />
            </div>

            {/* Reward and Contact */}
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {form.type === "lost" && (
                <div style={{ flex:1 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Reward (₹)</label>
                  <input type="number" placeholder="0 = no reward" value={form.reward} onChange={e => setForm(f=>({...f,reward:e.target.value}))} style={inp()} />
                </div>
              )}
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Contact</label>
                <input placeholder="Phone / Email" value={form.contact} onChange={e => setForm(f=>({...f,contact:e.target.value}))} style={inp()} />
              </div>
            </div>

            <button onClick={handlePost} disabled={isPosting}
              style={{ width:"100%", padding:14, borderRadius:12, background:"#06b6d4", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", opacity:isPosting?0.7:1 }}
            >
              {isPosting ? "Posting..." : "Post Now"}
            </button>
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