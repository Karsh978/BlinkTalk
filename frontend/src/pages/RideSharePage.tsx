import { useState, useEffect } from "react";
import {
  ArrowLeft, Car, MapPin, Calendar, Clock,
  Users, Plus, Phone, Loader, Search, X, Navigation
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function RideSharePage({ onBack }: { onBack: () => void }) {
  const { authUser } = useAuthStore();
  const [rides, setRides]           = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filterType, setFilterType] = useState<"all" | "offer" | "request">("all");
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo]     = useState("");

  // Form state
  const [form, setForm] = useState({
    type:    "offer" as "offer" | "request",
    from:    "",
    to:      "",
    date:    "",
    time:    "",
    seats:   "1",
    price:   "",
    vehicle: "",
    note:    "",
    useGPS:  false,
    fromLat: "", fromLng: "",
  });

  // Get GPS location
  const getGPS = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        reject,
        { enableHighAccuracy: true }
      )
    );

  // Auto-detect city from GPS using reverse geocoding
  const detectLocation = async () => {
    try {
      const loc = await getGPS();
      setForm(f => ({ ...f, fromLat: String(loc.lat), fromLng: String(loc.lng) }));
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`);
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || "Current location";
      setForm(f => ({ ...f, from: city, useGPS: true }));
      toast.success(`Location: ${city}`);
    } catch {
      toast.error("GPS access denied");
    }
  };

  const loadRides = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filterType !== "all") params.type = filterType;
      if (searchFrom) params.from = searchFrom;
      if (searchTo)   params.to   = searchTo;

      // Try GPS first
      try {
        const loc = await getGPS();
        setMyLocation(loc);
        params.latitude  = loc.lat;
        params.longitude = loc.lng;
      } catch {}

      const res = await axiosInstance.get("/rides", { params });
      setRides(res.data);
    } catch {
      toast.error("Could not load rides");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRides(); }, [filterType]);

  const handlePost = async () => {
    if (!form.from || !form.to || !form.date || !form.time) {
      toast.error("Fill all required fields"); return;
    }
    try {
      await axiosInstance.post("/rides", form);
      toast.success("Ride posted!");
      setShowForm(false);
      setForm({ type:"offer", from:"", to:"", date:"", time:"", seats:"1", price:"", vehicle:"", note:"", useGPS:false, fromLat:"", fromLng:"" });
      loadRides();
    } catch {
      toast.error("Failed to post ride");
    }
  };

  const inp = (style = {}) => ({
    width:"100%", background:"#f5f6fa", border:"1px solid #e8eaf0", borderRadius:10,
    padding:"10px 12px", fontSize:13, color:"#1a1b2e", outline:"none", boxSizing:"border-box" as const,
    ...style
  });

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f5f6fa", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"14px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#6c7bff" }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#1a1b2e" }}>🚗 Ride Share</h2>
          <button
            onClick={() => setShowForm(true)}
            style={{ marginLeft:"auto", width:36, height:36, borderRadius:10, background:"#6c7bff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
          >
            <Plus size={18} color="#fff" />
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          {(["all","offer","request"] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                background: filterType===t ? "#6c7bff" : "#f5f6fa",
                color: filterType===t ? "#fff" : "#636890" }}
            >
              {t === "all" ? "All" : t === "offer" ? "🚗 Offering" : "🙋 Requesting"}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          <div style={{ position:"relative", flex:1 }}>
            <MapPin size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9094b0" }} />
            <input placeholder="From..." value={searchFrom} onChange={e => setSearchFrom(e.target.value)}
              style={{ ...inp(), paddingLeft:28, width:"100%" }} />
          </div>
          <div style={{ position:"relative", flex:1 }}>
            <MapPin size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#6c7bff" }} />
            <input placeholder="To..." value={searchTo} onChange={e => setSearchTo(e.target.value)}
              style={{ ...inp(), paddingLeft:28, width:"100%" }} />
          </div>
          <button onClick={loadRides}
            style={{ width:38, height:38, borderRadius:10, background:"#6c7bff", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
          >
            <Search size={15} color="#fff" />
          </button>
        </div>
      </div>

      {/* Rides list */}
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {isLoading ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <Loader size={28} color="#6c7bff" style={{ animation:"spin 1s linear infinite", margin:"0 auto" }} />
            <p style={{ color:"#9094b0", fontSize:13, marginTop:12 }}>Loading rides...</p>
          </div>
        ) : rides.length === 0 ? (
          <div style={{ textAlign:"center", paddingTop:60, color:"#9094b0" }}>
            <Car size={36} style={{ margin:"0 auto 10px", opacity:0.3 }} />
            <p style={{ fontSize:14, fontWeight:600 }}>No rides found</p>
            <p style={{ fontSize:12, marginTop:4 }}>Post a ride using the + button</p>
          </div>
        ) : (
          rides.map((ride: any) => (
            <div key={ride._id} style={{ background:"#fff", borderRadius:16, padding:14, marginBottom:10, border:"1px solid #e8eaf0" }}>

              {/* Top row */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <img src={ride.userId?.profilePic || "/avatar.png"} style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#1a1b2e" }}>{ride.userId?.fullName}</div>
                  <div style={{ fontSize:10, color:"#9094b0" }}>{ride.distanceKm ? `${ride.distanceKm} km away` : ""}</div>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:8,
                  background: ride.type==="offer" ? "#6c7bff15" : "#1db87a15",
                  color: ride.type==="offer" ? "#6c7bff" : "#1db87a" }}>
                  {ride.type === "offer" ? "🚗 Offering" : "🙋 Requesting"}
                </span>
              </div>

              {/* Route */}
              <div style={{ background:"#f5f6fa", borderRadius:12, padding:"10px 12px", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#1db87a", flexShrink:0 }} />
                  <span style={{ fontSize:13, fontWeight:600, color:"#1a1b2e" }}>{ride.from}</span>
                </div>
                <div style={{ width:1, height:12, background:"#e8eaf0", marginLeft:3.5, marginBottom:6 }} />
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <MapPin size={8} color="#e83a6b" style={{ flexShrink:0 }} />
                  <span style={{ fontSize:13, fontWeight:600, color:"#1a1b2e" }}>{ride.to}</span>
                </div>
              </div>

              {/* Details row */}
              <div style={{ display:"flex", gap:12, marginBottom:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, color:"#636890", display:"flex", alignItems:"center", gap:4 }}>
                  <Calendar size={11} /> {new Date(ride.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                </span>
                <span style={{ fontSize:11, color:"#636890", display:"flex", alignItems:"center", gap:4 }}>
                  <Clock size={11} /> {ride.time}
                </span>
                <span style={{ fontSize:11, color:"#636890", display:"flex", alignItems:"center", gap:4 }}>
                  <Users size={11} /> {ride.seatsLeft}/{ride.seats} seats
                </span>
                {ride.price > 0 && (
                  <span style={{ fontSize:11, color:"#1db87a", fontWeight:600 }}>₹{ride.price}/seat</span>
                )}
                {ride.vehicle && (
                  <span style={{ fontSize:11, color:"#636890" }}>🚙 {ride.vehicle}</span>
                )}
              </div>

              {ride.note && (
                <p style={{ fontSize:12, color:"#9094b0", marginBottom:10, fontStyle:"italic" }}>"{ride.note}"</p>
              )}

              {/* Action buttons */}
              <div style={{ display:"flex", gap:8, paddingTop:8, borderTop:"1px solid #f0f0f5" }}>
                {ride.userId?.phoneNumber && (
                  <a href={`tel:${ride.userId.phoneNumber}`}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:10, background:"#1db87a15", color:"#1db87a", fontSize:12, fontWeight:600, textDecoration:"none" }}
                  >
                    <Phone size={13} /> Call
                  </a>
                )}
                {/* Share via chat */}
                <button
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", borderRadius:10, background:"#6c7bff15", color:"#6c7bff", fontSize:12, fontWeight:600, border:"none", cursor:"pointer" }}
                  onClick={() => toast.success("Message feature coming soon!")}
                >
                  💬 Message
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post ride form */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={() => setShowForm(false)}
        >
          <div style={{ background:"#fff", borderRadius:"20px 20px 0 0", padding:20, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width:36, height:4, background:"#e8eaf0", borderRadius:4, margin:"0 auto 16px" }} />
            <h3 style={{ fontWeight:800, fontSize:16, color:"#1a1b2e", marginBottom:16 }}>Post a Ride</h3>

            {/* Offer / Request toggle */}
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {(["offer","request"] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({...f, type:t}))}
                  style={{ flex:1, padding:"10px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:13,
                    background: form.type===t ? "#6c7bff" : "#f5f6fa",
                    color: form.type===t ? "#fff" : "#636890" }}
                >
                  {t === "offer" ? "🚗 Offering ride" : "🙋 Need a ride"}
                </button>
              ))}
            </div>

            {/* From field with GPS button */}
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>From *</label>
              <div style={{ display:"flex", gap:8 }}>
                <input placeholder="e.g. Indore" value={form.from} onChange={e => setForm(f => ({...f, from:e.target.value}))}
                  style={{ ...inp(), flex:1 }} />
                <button onClick={detectLocation}
                  title="Use my location"
                  style={{ width:40, height:40, borderRadius:10, background:"#6c7bff15", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
                >
                  <Navigation size={16} color="#6c7bff" />
                </button>
              </div>
            </div>

            {/* To field */}
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>To *</label>
              <input placeholder="e.g. Bhopal" value={form.to} onChange={e => setForm(f => ({...f, to:e.target.value}))}
                style={inp()} />
            </div>

            {/* Date and time */}
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))}
                  min={new Date().toISOString().split("T")[0]}
                  style={inp()} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Time *</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time:e.target.value}))}
                  style={inp()} />
              </div>
            </div>

            {/* Seats and price */}
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Seats</label>
                <input type="number" min="1" max="8" value={form.seats} onChange={e => setForm(f => ({...f, seats:e.target.value}))}
                  style={inp()} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Price/seat (₹)</label>
                <input type="number" placeholder="0 = free" value={form.price} onChange={e => setForm(f => ({...f, price:e.target.value}))}
                  style={inp()} />
              </div>
            </div>

            {/* Vehicle */}
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Vehicle (optional)</label>
              <input placeholder="e.g. Swift Dzire, White" value={form.vehicle} onChange={e => setForm(f => ({...f, vehicle:e.target.value}))}
                style={inp()} />
            </div>

            {/* Note */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:6, display:"block" }}>Note (optional)</label>
              <textarea placeholder="Any extra info..." value={form.note} onChange={e => setForm(f => ({...f, note:e.target.value}))}
                rows={2}
                style={{ ...inp(), resize:"none" as const }} />
            </div>

            <button onClick={handlePost}
              style={{ width:"100%", padding:14, borderRadius:12, background:"#6c7bff", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}
            >
              Post Ride
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ width:"100%", padding:12, marginTop:8, borderRadius:12, background:"transparent", border:"none", color:"#9094b0", fontSize:13, cursor:"pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}