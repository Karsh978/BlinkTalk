import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

const CallScreen = () => {
  const {
    isInCall, isCalling, callType, callReceiver, incomingCall,
    localStream, remoteStream,
    isMuted, isCameraOff,
    endCall, toggleMute, toggleCamera,
  } = useCallStore();

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const person = callReceiver || (incomingCall ? {
    fullName:   incomingCall.callerName,
    profilePic: incomingCall.callerPic,
  } : null);

  if (!isInCall && !isCalling) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900 flex flex-col">

      {/* Video call — remote stream fills screen */}
      {callType === "video" ? (
        <div className="flex-1 relative bg-black">
          {/* Remote video — full screen */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video — small pip */}
          <div className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isCameraOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff size={20} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Connecting / calling overlay */}
          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
              <img
                src={person?.profilePic || "/avatar.png"}
                className="size-24 rounded-full object-cover border-4 border-white/20 mb-4"
              />
              <h2 className="text-white text-xl font-bold">{person?.fullName}</h2>
              <p className="text-white/60 text-sm mt-2 animate-pulse">
                {isCalling ? "Calling..." : "Connecting..."}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Audio call UI
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-gray-900">
          <div className="relative mb-6">
            <img
              src={person?.profilePic || "/avatar.png"}
              className="size-32 rounded-full object-cover border-4 border-white/20"
            />
            {isInCall && (
              <span className="absolute bottom-2 right-2 size-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <h2 className="text-white text-2xl font-bold">{person?.fullName}</h2>
          <p className="text-white/60 text-sm mt-2 animate-pulse">
            {isCalling ? "Calling..." : isInCall ? "Connected" : "Connecting..."}
          </p>
        </div>
      )}

      {/* Bottom controls */}
      <div className="h-28 bg-gray-900/90 flex items-center justify-center gap-6 px-8">

        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`size-14 rounded-full flex items-center justify-center transition-all ${
            isMuted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
          }`}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* End call */}
        <button
          onClick={endCall}
          className="size-16 rounded-full bg-red-500 flex items-center justify-center text-white"
        >
          <PhoneOff size={26} />
        </button>

        {/* Camera toggle — only for video calls */}
        {callType === "video" && (
          <button
            onClick={toggleCamera}
            className={`size-14 rounded-full flex items-center justify-center transition-all ${
              isCameraOff ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white"
            }`}
          >
            {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CallScreen;