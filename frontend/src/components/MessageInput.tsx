import { useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image as ImageIcon, Send, Smile, X, Mic, Square } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import MediaPanel from "./MediaPanel"; 

const MessageInput = ({ replyingTo, onReplySent }: { replyingTo?: any; onReplySent?: () => void }) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMedia, setShowMedia] = useState(false); 
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { authUser, socket } = useAuthStore();

  // ── Block check ──
  const isBlockedByMe = authUser?.blockedUsers?.includes(selectedUser?._id);
  const isBlockedByThem = selectedUser?.blockedUsers?.includes(authUser?._id);
  const isBlocked = isBlockedByMe || isBlockedByThem;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
      if (!socket || !authUser || !selectedUser) return;
      socket.emit("typing", { senderId: authUser._id, receiverId: selectedUser._id });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedUser._id });
      }, 2000);
    },
    [socket, authUser, selectedUser]
  );

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleMediaSelect = async (url: string) => {
    try {
      await sendMessage({ image: url });
      setShowMedia(false);
    } catch (error) {
      console.error("Failed to send media message:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      setShowEmojiPicker(false);
      setShowMedia(false);

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            await sendMessage({ audio: base64Audio });
          } catch (error) {
            console.error("Failed to send audio message:", error);
          }
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (socket && authUser && selectedUser) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("stopTyping", { senderId: authUser._id, receiverId: selectedUser._id });
    }
    try {
     await sendMessage({ 
  text: text.trim(), 
  image: imagePreview,
  replyTo: replyingTo?._id || null,
});
onReplySent?.();
      setText("");
      setImagePreview(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const canSend = !!(text.trim() || imagePreview);

  // ── Blocked state: show message instead of input ──
  if (isBlocked) {
    return (
      <div className="p-2 md:p-4 bg-base-100 border-t border-base-300 relative shrink-0">
        <div className="text-center text-sm p-3 bg-base-200 rounded-xl text-base-content/70">
          {isBlockedByMe
            ? "You have blocked this user. Unblock to send messages."
            : "You can't message this user."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 bg-base-100 border-t border-base-300 relative shrink-0">
      
      {/* Media Panel Overlay Popups */}
      {showMedia && (
        <MediaPanel onSelect={handleMediaSelect} onClose={() => setShowMedia(false)} />
      )}

      {/* Emoji Picker Layout Panel Wrapper */}
      {showEmojiPicker && (
        <div className="absolute bottom-[100%] left-4 z-[100] rounded-2xl overflow-hidden shadow-xl mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.LIGHT}
            skinTonesDisabled
            height={350}
            width={300}
          />
        </div>
      )}

      {/* Image Preview Rendering Staged Strip */}
      {imagePreview && !isRecording && (
        <div className="relative inline-block mb-3 ml-2">
          <img src={imagePreview} alt="Preview" className="size-16 md:size-20 object-cover rounded-xl border border-primary/20 shadow-md" />
          <button 
            type="button"
            onClick={removeImage}
            className="absolute -top-1.5 -right-1.5 size-5 bg-error border-2 border-base-100 rounded-full flex items-center justify-center text-error-content hover:scale-110 transition-transform shadow-sm"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Form Interaction Row Elements */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-1 md:gap-2">
        {isRecording ? (
          /* Active Recording Track Wrapper UI */
          <div className="flex-1 flex items-center justify-between bg-error/10 border border-error/20 p-2 px-4 rounded-full animate-pulse h-10">
            <span className="text-error font-medium text-xs md:text-sm flex items-center gap-2">
              <span className="size-2 rounded-full bg-error inline-block" />
              Recording Audio...
            </span>
            <button
              type="button"
              className="p-1 text-error hover:bg-error/20 rounded-full transition-colors"
              onClick={stopRecording}
              title="Stop Recording"
            >
              <Square size={16} fill="currentColor" />
            </button>
          </div>
        ) : (
          /* Normal Input Stream Configuration */
          <>
            {/* Control Attachment Actions Container Group */}
            <div className="flex items-center shrink-0">
              {/* Emoji Trigger Icon toggle */}
              <button 
                type="button" 
                className={`p-2 rounded-full transition-colors ${showEmojiPicker ? "text-primary bg-primary/10" : "text-zinc-500 hover:bg-base-200"}`}
                onClick={() => {
                  setShowEmojiPicker((v) => !v);
                  setShowMedia(false);
                }}
              >
                <Smile size={20} />
              </button>

              {/* Media GIFs Panel Action Wrapper */}
              <button
                type="button"
                className={`text-xs font-bold p-2 px-2.5 mx-0.5 rounded-full transition-colors ${showMedia ? "text-primary bg-primary/10" : "text-zinc-500 hover:bg-base-200"}`}
                onClick={() => {
                  setShowMedia((v) => !v);
                  setShowEmojiPicker(false);
                }}
              >
                GIF
              </button>

              {/* Hidden Local File Sync Elements */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {/* File Selection Pipeline Action Element */}
              <button 
                type="button" 
                className={`hidden sm:block p-2 rounded-full transition-colors ${imagePreview ? "text-success bg-success/10" : "text-zinc-500 hover:bg-base-200"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={20} />
              </button>
            </div>

            {/* Main Interactive Scaled Input Node Box */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Message"
                className="w-full input input-bordered rounded-full bg-base-200 border-none focus:outline-none focus:bg-base-100 focus:ring-2 focus:ring-primary/20 h-10 px-4 text-sm transition-all"
                value={text}
                onChange={handleInputChange}
                onFocus={() => {
                  setShowEmojiPicker(false);
                  setShowMedia(false);
                }}
              />
            </div>

            {/* Conditional Action Handler: Mic Node OR Send Action Trigger */}
            {!canSend ? (
              <button
                type="button"
                onClick={startRecording}
                className="btn btn-circle btn-ghost btn-sm md:btn-md h-10 w-10 min-h-0 text-zinc-500 hover:bg-base-200 shrink-0"
                title="Record voice message"
              >
                <Mic size={20} />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={!canSend}
                className="btn btn-circle btn-primary btn-sm md:btn-md h-10 w-10 min-h-0 shrink-0 shadow-md shadow-primary/20"
                title="Send Message"
              >
                <Send size={18} />
              </button>
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default MessageInput;