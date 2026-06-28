import { useEffect, useState } from "react";
import { X, Trash2, Eye } from "lucide-react";
import { useStatusStore } from "../store/useStatusStore";
import { useAuthStore } from "../store/useAuthStore";

const StatusViewer = ({ group, onClose }: { group: any; onClose: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const { viewStatus, deleteStatus } = useStatusStore();
  const { authUser } = useAuthStore();

  const status = group.statuses[current];
  const isMe = group.user._id === authUser._id;
  const duration = 5000; // 5 seconds per status

  // Mark as viewed
  useEffect(() => {
    viewStatus(status._id);
  }, [current]);

  // Auto progress bar
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          if (current < group.statuses.length - 1) {
            setCurrent((c) => c + 1);
          } else {
            onClose();
          }
          return 100;
        }
        return p + (100 / (duration / 100));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [current]);

  const handleDelete = async () => {
    await deleteStatus(status._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">

      {/* Progress bars */}
      <div className="flex gap-1 p-3 pt-10">
        {group.statuses.map((_: any, i: number) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <img
            src={group.user.profilePic || "/avatar.png"}
            className="size-10 rounded-full object-cover border-2 border-white"
          />
          <div>
            <div className="text-white font-bold text-sm">{group.user.fullName}</div>
            <div className="text-white/60 text-xs">
              {new Date(status.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isMe && (
            <button onClick={handleDelete} className="text-white/70 hover:text-red-400 transition-colors">
              <Trash2 size={20} />
            </button>
          )}
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Status content */}
      <div
        className="flex-1 flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          // Tap left = previous, tap right = next
          const x = (e as any).clientX;
          const mid = window.innerWidth / 2;
          if (x < mid) {
            if (current > 0) setCurrent((c) => c - 1);
          } else {
            if (current < group.statuses.length - 1) setCurrent((c) => c + 1);
            else onClose();
          }
        }}
      >
        {status.image ? (
          <img src={status.image} className="max-h-full max-w-full object-contain" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{ background: status.textBg }}
          >
            <p className="text-4xl font-bold text-center leading-tight" style={{ color: status.textColor }}>
              {status.text}
            </p>
          </div>
        )}

        {/* Text overlay on image */}
        {status.image && status.text && (
          <div className="absolute bottom-24 left-0 right-0 text-center px-6">
            <p className="text-white text-xl font-bold drop-shadow-lg">{status.text}</p>
          </div>
        )}
      </div>

      {/* Views count (only for my status) */}
      {isMe && (
        <div className="p-4 flex items-center gap-2 text-white/60 text-sm">
          <Eye size={16} />
          <span>{status.viewers?.length || 0} views</span>
        </div>
      )}
    </div>
  );
};

export default StatusViewer;