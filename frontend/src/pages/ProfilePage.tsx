import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Shield, Calendar } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const joinedDate = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString([], { month: "long", year: "numeric" })
    : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0f1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 20px 40px",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        .profile-card {
          width: 100%;
          max-width: 480px;
          background: #1c1e2e;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .profile-banner {
          height: 110px;
          background: linear-gradient(135deg, #2e3156 0%, #1c1e2e 60%, #252740 100%);
          position: relative;
        }
        .profile-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(108,123,255,0.18), transparent 70%);
        }

        .avatar-ring {
          position: relative;
          width: 96px; height: 96px;
          margin: -48px auto 0;
          z-index: 2;
        }
        .avatar-img {
          width: 96px; height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #1c1e2e;
          display: block;
          transition: opacity 0.2s;
        }
        .avatar-img.uploading { opacity: 0.6; }

        .camera-label {
          position: absolute;
          bottom: 2px; right: 2px;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6c7bff, #818cf8);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          border: 2px solid #1c1e2e;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(108,123,255,0.4);
        }
        .camera-label:hover { transform: scale(1.1); box-shadow: 0 4px 14px rgba(108,123,255,0.55); }
        .camera-label.uploading { animation: pulse 1s ease-in-out infinite; pointer-events: none; }

        @keyframes pulse {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .profile-body {
          padding: 16px 28px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .profile-name {
          font-size: 20px;
          font-weight: 800;
          color: #e8eaf6;
          letter-spacing: -0.03em;
          margin-top: 8px;
        }
        .profile-upload-hint {
          font-size: 12px;
          color: #636890;
          margin-bottom: 8px;
        }
        .profile-upload-hint.loading { color: #818cf8; }

        .info-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }

        .info-row {
          background: #252740;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: border-color 0.2s;
        }
        .info-row:hover { border-color: rgba(108,123,255,0.25); }

        .info-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: rgba(108,123,255,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #818cf8;
        }

        .info-label {
          font-size: 11px;
          color: #636890;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 14px;
          color: #e8eaf6;
          font-weight: 500;
        }

        .badge-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .badge {
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .badge.verified {
          background: rgba(74,222,128,0.1);
          color: #4ade80;
          border: 1px solid rgba(74,222,128,0.2);
        }
        .badge.member {
          background: rgba(108,123,255,0.1);
          color: #818cf8;
          border: 1px solid rgba(108,123,255,0.2);
        }

        /* Ambient glows */
        .glow-1 {
          position: fixed;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(108,123,255,0.1), transparent 70%);
          top: -100px; left: -100px;
          pointer-events: none;
          filter: blur(60px);
        }
        .glow-2 {
          position: fixed;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.07), transparent 70%);
          bottom: 0; right: 0;
          pointer-events: none;
          filter: blur(60px);
        }
      `}</style>

      <div className="glow-1" />
      <div className="glow-2" />

      <div className="profile-card">
        {/* Banner */}
        <div className="profile-banner" />

        {/* Body */}
        <div className="profile-body">

          {/* Avatar */}
          <div className="avatar-ring">
            <img
              src={selectedImg || authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className={`avatar-img${isUpdatingProfile ? " uploading" : ""}`}
            />
            <label
              htmlFor="avatar-upload"
              className={`camera-label${isUpdatingProfile ? " uploading" : ""}`}
              title="Change photo"
            >
              <Camera size={13} color="#fff" />
              <input
                type="file"
                id="avatar-upload"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>

          <div className="profile-name">{authUser?.fullName}</div>

          <p className={`profile-upload-hint${isUpdatingProfile ? " loading" : ""}`}>
            {isUpdatingProfile ? "Uploading photo…" : "Click camera to update photo"}
          </p>

          {/* Badges */}
          <div className="badge-row">
            <span className="badge verified">
              <Shield size={11} />
              Verified
            </span>
            {joinedDate && (
              <span className="badge member">
                <Calendar size={11} />
                Joined {joinedDate}
              </span>
            )}
          </div>

          {/* Info rows */}
          <div className="info-section">
            <div className="info-row">
              <div className="info-icon"><User size={16} /></div>
              <div>
                <div className="info-label">Full Name</div>
                <div className="info-value">{authUser?.fullName}</div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-icon"><Mail size={16} /></div>
              <div>
                <div className="info-label">Email Address</div>
                <div className="info-value">{authUser?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;