import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Phone, Video, Ban, Trash2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";
import { useThemeStore } from "../store/useThemeStore";
import { axiosInstance } from "../lib/axios"; 
import { useCallStore } from "../store/useCallStore"; 


// ── Custom Long Press Hook for MessageBubble Handler ──
const useLongPress = (callback: () => void, ms = 600) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    timerRef.current = setTimeout(() => {
      callback();
    }, ms);
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
};

// ── Sub-Component: MessageBubble (With Seen/Unseen Status Ticks) ──
const MessageBubble = ({ message, onLongPress, authUser }: { message: any; onLongPress: () => void; authUser: any }) => {
  const isMe = message.senderId === authUser._id || message.senderId?._id === authUser._id;
  const longPressEvent = useLongPress(onLongPress);
  
  // State for emoji bar toggle (Make sure to define or handle this state if needed)
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  return (
    // Added "group" class here as requested
    <div 
      {...(!message.isDeleted ? longPressEvent : {})} 
      className={`chat ${isMe ? "chat-end" : "chat-start"} select-none group ${!message.isDeleted ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Chat Bubble Structure */}
      <div 
        className={`chat-bubble max-w-[85%] text-sm p-3 shadow-sm transition-all duration-200 ${
          message.isDeleted 
            ? "bg-base-300 opacity-50 text-base-content/70" 
            : isMe 
              ? "bg-primary text-primary-content" 
              : "bg-base-200"
        }`}
      >
        {message.isDeleted ? (
          <p className="italic text-xs flex items-center gap-2 py-0.5">
            🚫 This message was deleted
          </p>
        ) : (
          <>
            {/* Audio Player */}
            {message.audio && (
              <div className="py-2">
                <audio controls key={message._id} className="h-10 w-full max-w-[240px]">
                  <source src={message.audio} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Text Message */}
            {message.text && <p>{message.text}</p>}

            {/* Media Uploads */}
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

      {/* Emoji reaction trigger (Added right under the message bubble) */}
      {!message.isDeleted && (
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
          <button
            onClick={() => setShowEmojiBar((v) => !v)}
            className="opacity-0 group-hover:opacity-100 text-base-content/40 hover:text-base-content/70 text-xs px-1.5 py-0.5 rounded-full hover:bg-base-200 transition-all duration-150"
          >
            😊
          </button>
        </div>
      )}

      {/* Blue tick / single tick below sent messages */}
      {isMe && !message.isDeleted && (
        <div className="chat-footer opacity-70 text-[10px] flex items-center gap-1 mt-0.5">
          {message.isSeen ? (
            // Double blue tick — seen
            <span className="flex text-blue-400" title="Seen">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5l3 3L10 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          ) : (
            // Single grey tick — sent but not seen
            <span className="flex opacity-50" title="Sent">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 5l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )
          }
        </div>
      )}
    </div>
  );
};

// ── Main Component: ChatContainer ──
const ChatContainer = () => {
  const { startCall } = useCallStore(); 

  const { 
    messages, 
    getMessages, 
    getGroupMessages, 
    selectedUser, 
    selectedGroup, 
    setSelectedUser, 
    setSelectedGroup, 
    subscribeToMessages, 
    unsubscribeFromMessages, 
    deleteMessage,
    clearChat,
  } = useChatStore();
  
  // Destructured toggleBlock from useAuthStore
  const { authUser, socket, toggleBlock } = useAuthStore(); 
  const { fontSize, wallpaper } = useThemeStore();
  const scrollRef = useRef<any>(null);

  // Check if the current selected user is blocked
  const isBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);

  // Delete Action Panel States
  const [deleteMenu, setDeleteMenu] = useState<{ isOpen: boolean; msgId: string; isSender: boolean }>({
    isOpen: false,
    msgId: "",
    isSender: false
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDelete = async (type: "me" | "everyone") => {
    try {
      await deleteMessage(deleteMenu.msgId, type);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setDeleteMenu({ ...deleteMenu, isOpen: false });
    }
  };

  // Sync Messages Feed, Socket events & Seen Status Hooks
 useEffect(() => {
  if (selectedUser) {
    getMessages(selectedUser._id);
    axiosInstance.put(`/messages/seen/${selectedUser._id}`).catch(() => {});
  }
  if (selectedGroup) getGroupMessages(selectedGroup._id);

  subscribeToMessages(); // ✅ Har baar selectedUser change hone par re-subscribe

  if (socket) {
    socket.on("messagesSeen", ({ seenBy }: any) => {
      if (selectedUser && seenBy?.toString() === selectedUser._id?.toString()) {
        useChatStore.setState((state) => ({
          messages: state.messages.map((m: any) =>
            m.senderId?.toString() === selectedUser._id?.toString()
              ? { ...m, isSeen: true }
              : m
          ),
        }));
      }
    });
  }

  return () => {
    unsubscribeFromMessages();
    if (socket) socket.off("messagesSeen");
  };
}, [selectedUser?._id, selectedGroup?._id, socket]); // ✅ selectedUser._id pe dependency

  // Infinite Scroll Anchor Adjustment
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-base-100 h-full">
      
      {/* Modern Top Layout Header */}
      <div className="p-3 border-b border-base-300 flex items-center justify-between bg-base-100/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {/* Mobile Back Button */}
          <button 
            onClick={() => { setSelectedUser(null); setSelectedGroup(null); }} 
            className="md:hidden p-1 hover:bg-base-200 rounded-full transition-colors duration-150"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Profile Avatar */}
          <div className="avatar">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center font-bold overflow-hidden">
              {selectedUser ? (
                <img src={selectedUser.profilePic || "/avatar.png"} alt="profile" />
              ) : (
                selectedGroup?.name ? selectedGroup.name[0] : "G"
              )}
            </div>
          </div>
          
          {/* User Status Block */}
          <div className="overflow-hidden min-w-0 flex-1 pr-2">
            <h3 className="font-bold text-sm truncate">
              {selectedUser ? selectedUser.fullName : selectedGroup?.name}
            </h3>
            <p className="text-[10px] opacity-60">
              {selectedUser ? (isBlocked ? "Blocked" : "Online") : "Group Chat"}
            </p>
          </div>
        </div>

        {/* Action Layer: Block Button & Media Call Icons */}
        <div className="flex items-center gap-3 text-base-content/70 pr-1 shrink-0">
          {/* Block Button */}
          {selectedUser && (
            <button
              onClick={() => toggleBlock(selectedUser._id)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-colors duration-150 ${
                isBlocked
                  ? "bg-error/10 text-error animate-pulse"
                  : "hover:bg-base-200 text-base-content/70"
              }`}
              title={isBlocked ? "Unblock user" : "Block user"}
            >
              <Ban size={16} />
              <span className="hidden sm:inline">
                {isBlocked ? "Unblock" : "Block"}
              </span>
            </button>
          )}
          {/* Clear Chat Button */}
          {selectedUser && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150"
              title="Clear chat"
            >
              <Trash2 size={18} />
            </button>
          )}
          

          {/* Voice Call Button */}
          <button
            onClick={() => selectedUser && startCall(selectedUser, "audio")}
            disabled={!selectedUser || isBlocked}
            className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150 disabled:opacity-30"
            title="Voice call"
          >
            <Phone size={18} />
          </button>

          {/* Video Call Button */}
          <button
            onClick={() => selectedUser && startCall(selectedUser, "video")}
            disabled={!selectedUser || isBlocked}
            className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150 disabled:opacity-30"
            title="Video call"
          >
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Main Messages Container Window */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          fontSize: fontSize === "small" ? 13 : fontSize === "large" ? 18 : 15,
          // Custom Wallpaper Background Logic
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
            onLongPress={() => {
              if (message.isDeleted) return;
              const isMe = message.senderId === authUser?._id || message.senderId?._id === authUser?._id;
              setDeleteMenu({ isOpen: true, msgId: message._id, isSender: isMe });
            }}
          />
        ))}
      </div>

      {/* Message Input Panel */}
      <MessageInput />

      {/* Bottom Sheet Contextual Menu */}
      {deleteMenu.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm" 
          onClick={() => setDeleteMenu({ ...deleteMenu, isOpen: false })}
        >
          <div 
            className="bg-base-100 w-full max-w-md rounded-t-3xl p-6 " 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-6" /> 
            
            <h3 className="font-bold text-lg mb-4 text-center">Delete Message?</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleDelete("me")} 
                className="btn btn-ghost justify-start gap-3 normal-case"
              >
                🗑️ Delete for me
              </button>
              
              {deleteMenu.isSender && (
                <button 
                  onClick={() => handleDelete("everyone")} 
                  className="btn btn-ghost justify-start gap-3 text-error normal-case"
                >
                  🌎 Delete for everyone
                </button>
              )}
              
              <button 
                onClick={() => setDeleteMenu({ ...deleteMenu, isOpen: false })} 
                className="btn btn-outline mt-4 normal-case"
              >
                Cancel
              </button>
              {/* Clear Chat Confirmation */}
              {showClearConfirm && (
                <div
                  className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  <div
                    className="bg-base-100 w-full max-w-md rounded-t-3xl p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-6" />
                    <h3 className="font-bold text-lg mb-2 text-center">Clear Chat?</h3>
                    <p className="text-sm text-base-content/60 text-center mb-6">
                      All messages will be deleted for you only. This cannot be undone.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={async () => {
                          await clearChat(selectedUser._id);
                          setShowClearConfirm(false);
                        }}
                        className="btn btn-error normal-case"
                      >
                        🗑️ Clear for me
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="btn btn-outline mt-2 normal-case"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;