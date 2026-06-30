import { useState, useEffect } from "react";
import { ArrowLeft, Droplet, Phone, MapPin, UserCheck, Loader } from "lucide-react";
import { useHelperStore } from "../store/useHelperStore";
import { useAuthStore } from "../store/useAuthStore";

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export default function BloodDonorPage({ onBack }: { onBack: () => void }) {
  const { donors, isLoading, findDonors, saveDonorProfile } = useHelperStore();
  const { authUser } = useAuthStore();

  const [filterGroup, setFilterGroup] = useState("all");
  const [showRegister, setShowRegister] = useState(false);
  const [myBloodGroup, setMyBloodGroup] = useState(authUser?.bloodGroup || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    findDonors(filterGroup);
  }, [filterGroup]);

  const handleRegister = async () => {
    if (!myBloodGroup) return;
    setIsSaving(true);
    const success = await saveDonorProfile(myBloodGroup, true);
    setIsSaving(false);
    if (success) {
      setShowRegister(false);
      findDonors(filterGroup);
    }
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f5f6fa", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ background:"#fff", padding:"14px 20px", borderBottom:"1px solid #e8eaf0", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#e83a6b", display:"flex" }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#1a1b2e" }}>🩸 Blood Donors</h2>
          <button
            onClick={() => setShowRegister(true)}
            style={{ marginLeft:"auto", padding:"7px 14px", borderRadius:10, background:"#e83a6b", border:"none", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}
          >
            {authUser?.isAvailableDonor ? "Update profile" : "Become a donor"}
          </button>
        </div>
      </div>

      {/* Blood group filter */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e8eaf0", padding:"12px 16px", display:"flex", gap:8, overflowX:"auto", flexShrink:0 }}>
        <button
          onClick={() => setFilterGroup("all")}
          style={{ flexShrink:0, padding:"6px 14px", borderRadius:20, border:"1px solid #e8eaf0", background: filterGroup==="all" ? "#e83a6b" : "#fff", color: filterGroup==="all" ? "#fff" : "#636890", fontSize:12, fontWeight:600, cursor:"pointer" }}
        >
          All
        </button>
        {BLOOD_GROUPS.map(bg => (
          <button
            key={bg}
            onClick={() => setFilterGroup(bg)}
            style={{ flexShrink:0, padding:"6px 14px", borderRadius:20, border:"1px solid #e8eaf0", background: filterGroup===bg ? "#e83a6b" : "#fff", color: filterGroup===bg ? "#fff" : "#636890", fontSize:12, fontWeight:600, cursor:"pointer" }}
          >
            {bg}
          </button>
        ))}
      </div>

      {/* Donor list */}
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        {isLoading ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <Loader size={28} color="#e83a6b" style={{ animation:"spin 1s linear infinite", margin:"0 auto" }} />
            <p style={{ color:"#9094b0", fontSize:13, marginTop:12 }}>Finding nearby donors...</p>
          </div>
        ) : donors.length === 0 ? (
          <div style={{ textAlign:"center", paddingTop:60, color:"#9094b0" }}>
            <Droplet size={36} style={{ margin:"0 auto 10px", opacity:0.3 }} />
            <p style={{ fontSize:14, fontWeight:600 }}>No donors found nearby</p>
            <p style={{ fontSize:12, marginTop:4 }}>Try a different blood group or check back later</p>
          </div>
        ) : (
          donors
            .sort((a:any, b:any) => a.distanceKm - b.distanceKm)
            .map((donor: any) => (
              <div key={donor._id} style={{ background:"#fff", borderRadius:16, padding:14, marginBottom:10, border:"1px solid #e8eaf0", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <img src={donor.profilePic || "/avatar.png"} style={{ width:48, height:48, borderRadius:"50%", objectFit:"cover" }} alt={donor.fullName} />
                  <div style={{ position:"absolute", bottom:-2, right:-2, background:"#e83a6b", color:"#fff", fontSize:9, fontWeight:700, borderRadius:6, padding:"1px 5px" }}>
                    {donor.bloodGroup}
                  </div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#1a1b2e" }}>{donor.fullName}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:3 }}>
                    <MapPin size={11} color="#9094b0" />
                    <span style={{ fontSize:11, color:"#9094b0" }}>{donor.distanceKm} km away</span>
                  </div>
                </div>
                {donor.phoneNumber && (
                  <a
                    href={`tel:${donor.phoneNumber}`}
                    style={{ width:38, height:38, borderRadius:"50%", background:"#1db87a15", display:"flex", alignItems:"center", justifyContent:"center", color:"#1db87a", flexShrink:0 }}
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            ))
        )}
      </div>

      {/* Register as donor modal */}
      {showRegister && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setShowRegister(false)}
        >
          <div style={{ background:"#fff", borderRadius:20, padding:24, width:"100%", maxWidth:360 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:"#e83a6b15", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                <UserCheck size={22} color="#e83a6b" />
              </div>
              <h3 style={{ fontWeight:800, fontSize:16, color:"#1a1b2e" }}>Become a Blood Donor</h3>
              <p style={{ fontSize:12, color:"#9094b0", marginTop:4 }}>Help save lives nearby. Your location will be shared.</p>
            </div>

            <p style={{ fontSize:11, fontWeight:700, color:"#9094b0", textTransform:"uppercase", marginBottom:8 }}>Select your blood group</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg}
                  onClick={() => setMyBloodGroup(bg)}
                  style={{ padding:"10px 0", borderRadius:10, border: myBloodGroup===bg ? "2px solid #e83a6b" : "1px solid #e8eaf0", background: myBloodGroup===bg ? "#e83a6b15" : "#fff", color: myBloodGroup===bg ? "#e83a6b" : "#636890", fontWeight:700, fontSize:13, cursor:"pointer" }}
                >
                  {bg}
                </button>
              ))}
            </div>

            <button
              onClick={handleRegister}
              disabled={!myBloodGroup || isSaving}
              style={{ width:"100%", padding:13, borderRadius:12, background:"#e83a6b", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", opacity: !myBloodGroup || isSaving ? 0.5 : 1 }}
            >
              {isSaving ? "Saving..." : "Confirm & Share Location"}
            </button>
            <button
              onClick={() => setShowRegister(false)}
              style={{ width:"100%", padding:13, marginTop:8, borderRadius:12, background:"transparent", border:"none", color:"#9094b0", fontWeight:600, fontSize:13, cursor:"pointer" }}
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