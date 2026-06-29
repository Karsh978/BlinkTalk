import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useCallStore } from "./store/useCallStore"; // Added missing import
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import CallScreen from "./components/CallScreen";
import IncomingCallModal from "./components/IncomingCallModal";

// Components & Pages
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { handleIncomingCall, handleCallAnswered, handleIceCandidate, endCall } = useCallStore();

  // 1. Initial auth check & notification permissions
  useEffect(() => {
    checkAuth();
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, [checkAuth]);

  // 2. Real-time socket signaling listeners for calls
  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAnswered", handleCallAnswered);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("callEnded", endCall);
    socket.on("callRejected", () => {
      endCall();
      alert("Call was rejected");
    });

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
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#eef0f7",
      }}>
        <Loader style={{ width: 40, height: 40, color: "#6c63ff", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <div data-theme="light" style={{ minHeight: "100vh", background: "#eef0f7" }}>
      <Navbar />
      <div style={{ paddingTop: 56 }}>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      
      {/* Real-time WebRTC Overlay Interfaces */}
      <IncomingCallModal />
      <CallScreen />
      
      <Toaster />
    </div>
  );
};

export default App;