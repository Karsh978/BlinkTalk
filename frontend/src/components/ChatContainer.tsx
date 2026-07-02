import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Phone, Video, Ban, Trash2, X, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";
import { useThemeStore } from "../store/useThemeStore";
import { axiosInstance } from "../lib/axios";

import { useCallStore } from "../store/useCallStore";

const useLongPress = (callback: () => void, ms = 600) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = () => { timerRef.current = setTimeout(callback, ms); };
  const stop = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  return { onMouseDown: start, onMouseUp: stop, onMouseLeave: stop, onTouchStart: start, onTouchEnd: stop };
};

// ── MessageBubble ──
const MessageBubble = ({
  message, onLongPress, authUser, onReact, onReply,
}: {
  message: any;
  onLongPress: () => void;
  authUser: any;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: any) => void;
}) => {
  const isMe = message.senderId === authUser._id || message.senderId?._id === authUser._id;
  const longPressEvent = useLongPress(onLongPress);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const emojiBarRef = useRef<HTMLDivElement>(null);

  const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

  // Close emoji bar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (emojiBarRef.current && !emojiBarRef.current.contains(e.target as Node)) {
        setShowEmojiBar(false);
      }
    };
    if (showEmojiBar) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showEmojiBar]);

  const myReaction = message.reactions?.find(
    (r: any) => r.userId?.toString() === authUser._id?.toString() || r.userId?._id?.toString() === authUser._id?.toString()
  );

  return (
    <div className={`chat ${isMe ? "chat-end" : "chat-start"} select-none group relative`}>

      {/* Chat Bubble */}
      <div
        {...(!message.isDeleted ? longPressEvent : {})}
        className={`chat-bubble max-w-[85%] text-sm p-3 shadow-sm transition-all duration-200 relative ${
          message.isDeleted
            ? "bg-base-300 opacity-50 text-base-content/70"
            : isMe
            ? "bg-primary text-primary-content"
            : "bg-base-200"
        }`}
      >
        {message.isDeleted ? (
          <p className="italic text-xs flex items-center gap-2 py-0.5">🚫 This message was deleted</p>
        ) : (
          <>
            {/* Reply preview — bubble ke andar */}
            {message.replyTo && !message.replyTo.isDeleted && (
              <div className={`text-xs px-3 py-2 mb-2 rounded-lg border-l-4 ${
                isMe
                  ? "bg-primary-content/10 border-primary-content/40 text-primary-content/70"
                  : "bg-base-300 border-primary text-base-content/60"
              }`}>
                <div className="font-semibold mb-0.5 text-[10px] uppercase tracking-wide opacity-70">Replied to</div>
                {message.replyTo.image && <div className="flex items-center gap-1"><span>📷</span><span>Photo</span></div>}
                {message.replyTo.audio && <div className="flex items-center gap-1"><span>🎤</span><span>Voice message</span></div>}
                {message.replyTo.text && <p className="truncate max-w-[200px]">{message.replyTo.text}</p>}
              </div>
            )}

            {message.audio && (
              <div className="py-2">
                <audio controls key={message._id} className="h-10 w-full max-w-[240px]">
                  <source src={message.audio} type="audio/webm" />
                </audio>
              </div>
            )}
            {message.text && <p>{message.text}</p>}
            {message.image && (
              <div className={message.image.includes("giphy.com") ? "" : "border border-black/5 rounded-lg overflow-hidden mt-1"}>
                <img
                  src={message.image}
                  className={message.image.includes("stickers") ? "w-32 h-32 object-contain" : "max-w-[250px] rounded-lg object-cover"}
                  alt="media"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Reactions display */}
      {message.reactions?.length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
          {Object.entries(
            message.reactions.reduce((acc: any, r: any) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(message._id, emoji)}
              className={`flex items-center gap-0.5 border rounded-full px-2 py-0.5 text-xs transition-colors ${
                myReaction?.emoji === emoji
                  ? "bg-primary/20 border-primary/40"
                  : "bg-base-200 border-base-300 hover:bg-base-300"
              }`}
            >
              <span>{emoji}</span>
              <span className="font-semibold text-base-content/70">{count as number}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action buttons: emoji + reply — hover on desktop, always visible on mobile */}
      {!message.isDeleted && (
        <div ref={emojiBarRef} className={`flex items-center gap-1 mt-1 relative ${isMe ? "justify-end" : "justify-start"}`}>

          {/* Emoji bar popup */}
          {showEmojiBar && (
            <div className={`absolute bottom-8 z-50 flex gap-1.5 p-1.5 bg-base-100 border border-base-300 shadow-xl rounded-full animate-in fade-in slide-in-from-bottom-2 duration-150 ${isMe ? "right-0" : "left-0"}`}>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message._id, emoji);
                    setShowEmojiBar(false);
                  }}
                  className={`text-lg hover:scale-125 transition-transform p-0.5 rounded-full ${myReaction?.emoji === emoji ? "bg-primary/20" : ""}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Emoji trigger — desktop hover + mobile always show */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowEmojiBar((v) => !v); }}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-base-content/40 hover:text-base-content/70 text-sm px-1.5 py-0.5 rounded-full hover:bg-base-200 transition-all duration-150"
            title="React"
          >
            😊
          </button>

          {/* Reply trigger */}
          <button
            onClick={() => onReply(message)}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-base-content/40 hover:text-base-content/70 text-sm px-1.5 py-0.5 rounded-full hover:bg-base-200 transition-all duration-150"
            title="Reply"
          >
            ↩️
          </button>
        </div>
      )}

      {/* Seen ticks */}
      {isMe && !message.isDeleted && (
        <div className="chat-footer opacity-70 text-[10px] flex items-center gap-1 mt-0.5">
          {message.isSeen ? (
            <span className="flex text-blue-400" title="Seen">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5l3 3L10 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          ) : (
            <span className="flex opacity-50" title="Sent">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 5l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ── ChatContainer ──
const ChatContainer = () => {
  const { startCall } = useCallStore();
  const {
    messages, getMessages, getGroupMessages,
    selectedUser, selectedGroup,
    setSelectedUser, setSelectedGroup,
    subscribeToMessages, unsubscribeFromMessages,
    deleteMessage, clearChat, toggleReaction,
      forwardMessage, // ← ADD
  users,          // ← ADD
  } = useChatStore();

  const { authUser, socket, toggleBlock } = useAuthStore();
  const { fontSize, wallpaper } = useThemeStore();
  const scrollRef = useRef<any>(null);

  const isBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);

  const [deleteMenu, setDeleteMenu] = useState<{ isOpen: boolean; msgId: string; isSender: boolean }>({
    isOpen: false, msgId: "", isSender: false,
  });
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [forwardMenu, setForwardMenu] = useState<{ isOpen: boolean; msgId: string }>({
  isOpen: false, msgId: "",
});
const [forwardSearch, setForwardSearch] = useState("");

  const handleDelete = async (type: "me" | "everyone") => {
    try {
      await deleteMessage(deleteMenu.msgId, type);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setDeleteMenu({ ...deleteMenu, isOpen: false });
    }
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      axiosInstance.put(`/messages/seen/${selectedUser._id}`).catch(() => {});
    }
    if (selectedGroup) getGroupMessages(selectedGroup._id);

    subscribeToMessages();

    if (socket) {
      socket.on("messagesSeen", ({ seenBy }: any) => {
        if (selectedUser && seenBy?.toString() === selectedUser._id?.toString()) {
          useChatStore.setState((state) => ({
            messages: state.messages.map((m: any) =>
              m.senderId?.toString() === selectedUser._id?.toString()
                ? { ...m, isSeen: true } : m
            ),
          }));
        }
      });
    }

    return () => {
      unsubscribeFromMessages();
      if (socket) socket.off("messagesSeen");
    };
  }, [selectedUser?._id, selectedGroup?._id, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-base-100 h-full">

      {/* Header */}
      <div className="p-3 border-b border-base-300 flex items-center justify-between bg-base-100/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <button
            onClick={() => { setSelectedUser(null); setSelectedGroup(null); }}
            className="md:hidden p-1 hover:bg-base-200 rounded-full transition-colors duration-150"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="avatar">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center font-bold overflow-hidden">
              {selectedUser ? (
                <img src={selectedUser.profilePic || "/avatar.png"} alt="profile" />
              ) : (
                selectedGroup?.name ? selectedGroup.name[0] : "G"
              )}
            </div>
          </div>
          <div className="overflow-hidden min-w-0 flex-1 pr-2">
            <h3 className="font-bold text-sm truncate">
              {selectedUser ? selectedUser.fullName : selectedGroup?.name}
            </h3>
            <p className="text-[10px] opacity-60">
              {selectedUser ? (isBlocked ? "Blocked" : "Online") : "Group Chat"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-base-content/70 pr-1 shrink-0">
          {selectedUser && (
            <button
              onClick={() => toggleBlock(selectedUser._id)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-colors duration-150 ${
                isBlocked ? "bg-error/10 text-error" : "hover:bg-base-200 text-base-content/70"
              }`}
              title={isBlocked ? "Unblock user" : "Block user"}
            >
              <Ban size={16} />
              <span className="hidden sm:inline">{isBlocked ? "Unblock" : "Block"}</span>
            </button>
          )}
          {selectedUser && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150"
              title="Clear chat"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={() => selectedUser && startCall(selectedUser, "audio")}
            disabled={!selectedUser || isBlocked}
            className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150 disabled:opacity-30"
          >
            <Phone size={18} />
          </button>
          <button
            onClick={() => selectedUser && startCall(selectedUser, "video")}
            disabled={!selectedUser || isBlocked}
            className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150 disabled:opacity-30"
          >
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          fontSize: fontSize === "small" ? 13 : fontSize === "large" ? 18 : 15,
          ...(wallpaper === "dots"      && { backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }),
          ...(wallpaper === "grid"      && { backgroundImage: "linear-gradient(rgba(128,128,128,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.1) 1px, transparent 1px)", backgroundSize: "24px 24px" }),
          ...(wallpaper === "waves"     && { backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.07) 10px, rgba(128,128,128,0.07) 20px)" }),
          ...(wallpaper === "bubbles"   && { backgroundImage: "radial-gradient(circle at 20% 50%, rgba(120,119,198,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.12) 0%, transparent 50%)" }),
          ...(wallpaper === "diagonal"  && { backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(128,128,128,0.06) 5px, rgba(128,128,128,0.06) 6px)" }),
          ...(wallpaper === "gradient1" && { background: "linear-gradient(135deg, rgba(255,154,100,0.15), rgba(208,112,150,0.15))" }),
          ...(wallpaper === "gradient2" && { background: "linear-gradient(135deg, rgba(100,200,255,0.15), rgba(50,100,200,0.15))" }),
          ...(wallpaper === "gradient3" && { background: "linear-gradient(135deg, rgba(100,200,100,0.15), rgba(50,150,80,0.15))" }),
        }}
      >
        {messages.map((message: any) => (
          <MessageBubble
            key={message._id}
            message={message}
            authUser={authUser}
            onReact={toggleReaction}
            onReply={setReplyingTo}
            onLongPress={() => {
              if (message.isDeleted) return;
              const isMe = message.senderId === authUser?._id || message.senderId?._id === authUser?._id;
              setDeleteMenu({ isOpen: true, msgId: message._id, isSender: isMe });
            }}
          />
        ))}
      </div>

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="px-4 py-2 bg-base-200 border-t border-base-300 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-1 h-10 bg-primary rounded-full shrink-0" />
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-primary mb-0.5">Replying to</div>
              <div className="text-xs text-base-content/60 truncate">
                {replyingTo.image ? "📷 Photo" : replyingTo.audio ? "🎤 Voice message" : replyingTo.text}
              </div>
            </div>
          </div>
          <button onClick={() => setReplyingTo(null)} className="btn btn-ghost btn-xs btn-circle shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Message Input */}
      <MessageInput replyingTo={replyingTo} onReplySent={() => setReplyingTo(null)} />

      {/* Delete Bottom Sheet */}
      {deleteMenu.isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteMenu({ ...deleteMenu, isOpen: false })}
        >
          <div className="bg-base-100 w-full max-w-md rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-6" />
            <h3 className="font-bold text-lg mb-4 text-center">Delete Message?</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleDelete("me")} className="btn btn-ghost justify-start gap-3 normal-case">
                🗑️ Delete for me
              </button>
              <button
  onClick={() => {
    setForwardMenu({ isOpen: true, msgId: deleteMenu.msgId });
    setDeleteMenu({ ...deleteMenu, isOpen: false });
  }}
  className="btn btn-ghost justify-start gap-3 normal-case"
>
  ↪️ Forward message
</button>
              {deleteMenu.isSender && (
                <button onClick={() => handleDelete("everyone")} className="btn btn-ghost justify-start gap-3 text-error normal-case">
                  🌎 Delete for everyone
                </button>
              )}
              <button onClick={() => setDeleteMenu({ ...deleteMenu, isOpen: false })} className="btn btn-outline mt-4 normal-case">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowClearConfirm(false)}
        >
          <div className="bg-base-100 w-full max-w-md rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-6" />
            <h3 className="font-bold text-lg mb-2 text-center">Clear Chat?</h3>
            <p className="text-sm text-base-content/60 text-center mb-6">
              All messages will be deleted for you only. This cannot be undone.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => { await clearChat(selectedUser._id); setShowClearConfirm(false); }}
                className="btn btn-error normal-case"
              >
                🗑️ Clear for me
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-outline mt-2 normal-case">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Message Modal */}
{forwardMenu.isOpen && (
  <div
    className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
    onClick={() => { setForwardMenu({ isOpen: false, msgId: "" }); setForwardSearch(""); }}
  >
    <div
      className="bg-base-100 w-full max-w-md rounded-t-3xl p-6 max-h-[70vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-4" />
      <h3 className="font-bold text-lg mb-4 text-center">Forward to</h3>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={forwardSearch}
          onChange={(e) => setForwardSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-base-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Contacts list */}
      <div className="overflow-y-auto flex flex-col gap-2 flex-1">
        {users
          .filter((u: any) =>
            u.fullName.toLowerCase().includes(forwardSearch.toLowerCase())
          )
          .map((u: any) => (
            <button
              key={u._id}
              onClick={async () => {
                await forwardMessage(forwardMenu.msgId, u._id);
                setForwardMenu({ isOpen: false, msgId: "" });
                setForwardSearch("");
              }}
              className="flex items-center gap-3 p-3 hover:bg-base-200 rounded-2xl transition-colors text-left"
            >
              <img
                src={u.profilePic || "/avatar.png"}
                alt={u.fullName}
                className="size-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-sm">{u.fullName}</div>
                <div className="text-xs text-base-content/50">{u.email}</div>
              </div>
            </button>
          ))}

        {users.filter((u: any) =>
          u.fullName.toLowerCase().includes(forwardSearch.toLowerCase())
        ).length === 0 && (
          <div className="text-center text-base-content/40 text-sm py-8">
            No contacts found
          </div>
        )}
      </div>

      <button
        onClick={() => { setForwardMenu({ isOpen: false, msgId: "" }); setForwardSearch(""); }}
        className="btn btn-outline mt-4 normal-case"
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  );


};

export default ChatContainer;