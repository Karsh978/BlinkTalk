import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../lib/utils";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser, toggleBlock } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isBlockedByMe = authUser?.blockedUsers?.includes(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100/50 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                onError={(e: any) => { e.target.src = "/avatar.png" }}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-xs text-base-content/70">
              {isOnline ? (
                <span className="text-emerald-500 font-medium">Online</span>
              ) : (
                `Last seen ${formatLastSeen(selectedUser.lastSeen)}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Block / Unblock button */}
          <button
            onClick={() => toggleBlock(selectedUser._id)}
            className={`btn btn-xs ${isBlockedByMe ? "btn-error" : "btn-ghost text-error"}`}
          >
            {isBlockedByMe ? "Unblock" : "Block"}
          </button>

          {/* Close button */}
          <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-sm btn-circle">
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;