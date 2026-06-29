import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useCallStore } from "./store/useCallStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import CallScreen from "./components/CallScreen";
import IncomingCallModal from "./components/IncomingCallModal";

import HomePage     from "./pages/HomePage";
import LoginPage    from "./pages/LoginPage";
import SignUpPage   from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage  from "./pages/ProfilePage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { handleIncomingCall, handleCallAnswered, handleIceCandidate, endCall } = useCallStore();

  useEffect(() => {
    checkAuth();
    if ("Notification" in window) Notification.requestPermission();
  }, [checkAuth]);

  useEffect(() => {
    if (!socket) return;
    socket.on("incomingCall",  handleIncomingCall);
    socket.on("callAnswered",  handleCallAnswered);
    socket.on("iceCandidate",  handleIceCandidate);
    socket.on("callEnded",     endCall);
    socket.on("callRejected",  () => { endCall(); alert("Call was rejected"); });
    return () => {
      socket.off("incomingCall");
      socket.off("callAnswered");
      socket.off("iceCandidate");
      socket.off("callEnded");
      socket.off("callRejected");
    };
  }, [socket, handleIncomingCall, handleCallAnswered, handleIceCandidate, endCall]);

  if (isCheckingAuth && !authUser) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0e0f1a", flexDirection:"column", gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#6c7bff,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Loader style={{ width:24, height:24, color:"#fff", animation:"spin 1s linear infinite" }} />
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div data-theme="light" style={{ minHeight:"100vh" }}>
      <Routes>
        <Route path="/"        element={authUser ? <HomePage />    : <Navigate to="/login" />} />
        <Route path="/signup"  element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login"   element={!authUser ? <LoginPage />  : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <IncomingCallModal />
      <CallScreen />
      <Toaster />
    </div>
  );
};

export default App;