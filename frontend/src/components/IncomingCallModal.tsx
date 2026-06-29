import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

const IncomingCallModal = () => {
  const { incomingCall, answerCall, rejectCall } = useCallStore();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-base-100 w-full max-w-md rounded-t-3xl p-8 flex flex-col items-center gap-4">

        {/* Caller avatar */}
        <div className="relative">
          <img
            src={incomingCall.callerPic || "/avatar.png"}
            className="size-20 rounded-full object-cover border-4 border-primary/30"
          />
          <span className="absolute -bottom-1 -right-1 size-6 bg-green-400 rounded-full border-2 border-base-100 animate-pulse" />
        </div>

        {/* Caller info */}
        <div className="text-center">
          <h3 className="font-bold text-lg">{incomingCall.callerName}</h3>
          <p className="text-sm opacity-60 flex items-center gap-1 justify-center mt-1">
            {incomingCall.callType === "video"
              ? <><Video size={14} /> Incoming video call</>
              : <><Phone size={14} /> Incoming voice call</>
            }
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-12 mt-2">
          {/* Reject */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={rejectCall}
              className="size-16 rounded-full bg-red-500 flex items-center justify-center text-white"
            >
              <PhoneOff size={24} />
            </button>
            <span className="text-xs opacity-60">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={answerCall}
              className="size-16 rounded-full bg-green-500 flex items-center justify-center text-white"
            >
              <Phone size={24} />
            </button>
            <span className="text-xs opacity-60">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;