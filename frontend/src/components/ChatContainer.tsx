import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Phone, Video } from "lucide-react"; // Added Phone & Video Icons
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";

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

// ── Sub-Component: MessageBubble ──
const MessageBubble = ({ message, onLongPress, authUser }: { message: any; onLongPress: () => void; authUser: any }) => {
  const isMe = message.senderId === authUser._id || message.senderId?._id === authUser._id;
  const longPressEvent = useLongPress(onLongPress);

  return (
    <div 
      {...(!message.isDeleted ? longPressEvent : {})} 
      className={`chat ${isMe ? "chat-end" : "chat-start"} select-none ${!message.isDeleted ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Updated Chat Bubble with max-w-[85%] and customized typography */}
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
            {/* Audio Component Player */}
            {message.audio && (
              <div className="py-2">
                <audio controls key={message._id} className="h-10 w-full max-w-[240px]">
                  <source src={message.audio} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Text Node */}
            {message.text && <p>{message.text}</p>}

            {/* Staged Images, GIFs, & Stickers */}
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
    </div>
  );
};

// ── Main Component: ChatContainer ──
const ChatContainer = () => {
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
    deleteMessage 
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const scrollRef = useRef<any>(null);

  // Delete Action Panel States
  const [deleteMenu, setDeleteMenu] = useState<{ isOpen: boolean; msgId: string; isSender: boolean }>({
    isOpen: false,
    msgId: "",
    isSender: false
  });

  // Delete handler triggered with specified deletion range
  const handleDelete = async (type: "me" | "everyone") => {
    try {
      await deleteMessage(deleteMenu.msgId, type);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setDeleteMenu({ ...deleteMenu, isOpen: false });
    }
  };

  // Sync Messages Feed Hook
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
    if (selectedGroup) getGroupMessages(selectedGroup._id);

    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, selectedGroup?._id]);

  // Infinite Scroll Anchor Adjustment
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-base-100 h-full">
      
      {/* Updated Modern Layout Header Wrapper */}
      <div className="p-3 border-b border-base-300 flex items-center justify-between bg-base-100/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Mobile Navigator Action */}
          <button 
            onClick={() => { setSelectedUser(null); setSelectedGroup(null); }} 
            className="md:hidden p-1 hover:bg-base-200 rounded-full transition-colors duration-150"
          >
            <ChevronLeft size={24} />
          </button>
          
          {/* Main User Avatar */}
          <div className="avatar">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center font-bold overflow-hidden">
              {selectedUser ? (
                <img src={selectedUser.profilePic || "/avatar.png"} alt="profile" />
              ) : (
                selectedGroup?.name ? selectedGroup.name[0] : "G"
              )}
            </div>
          </div>
          
          {/* User Status Content block */}
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm truncate">
              {selectedUser ? selectedUser.fullName : selectedGroup?.name}
            </h3>
            <p className="text-[10px] opacity-60">
              {selectedUser ? "Online" : "Group Chat"}
            </p>
          </div>
        </div>

        {/* Small Controlled Media Actions Utility */}
        <div className="flex gap-3 text-base-content/70 pr-1">
          <button className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150">
            <Phone size={18} />
          </button>
          <button className="hover:bg-base-200 p-1.5 rounded-full transition-colors duration-150">
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: any) => (
          <MessageBubble 
            key={message._id} 
            message={message} 
            authUser={authUser}
            onLongPress={() => {
              if (message.isDeleted) return;

              const isMe = message.senderId === authUser?._id || message.senderId?._id === authUser?._id;
              setDeleteMenu({ 
                isOpen: true, 
                msgId: message._id, 
                isSender: isMe 
              });
            }} 
          />
        ))}
      </div>

      {/* Message Input Panel */}
      <MessageInput />

      {/* Bottom Sheet Style Delete Modal */}
      {deleteMenu.isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm" 
          onClick={() => setDeleteMenu({ ...deleteMenu, isOpen: false })}
        >
          <div 
            className="bg-base-100 w-full max-w-md rounded-t-3xl p-6 animate-in slide-in-from-bottom" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar layout structure anchor */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;