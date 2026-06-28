import { useState, useRef } from "react";
import { X, Image, Type, Send } from "lucide-react";
import { useStatusStore } from "../store/useStatusStore";

const BG_COLORS = ["#6c7bff","#e83a6b","#1db87a","#f59e0b","#8b5cf6","#ef4444","#0ea5e9","#000000"];
const TEXT_COLORS = ["#ffffff","#000000","#fbbf24","#34d399","#f87171"];

// ✅ Fix — isOpen add karo
const AddStatusModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null; // ✅ Add this line at top of component
  const [tab, setTab]               = useState<"photo" | "text">("photo");
  const [image, setImage]           = useState<string | null>(null);
  const [text, setText]             = useState("");
  const [textColor, setTextColor]   = useState("#ffffff");
  const [textBg, setTextBg]         = useState("#6c7bff");
  const [caption, setCaption]       = useState("");
  const [isPosting, setIsPosting]   = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);
  const { createStatus }            = useStatusStore();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!image && !text.trim()) return;
    setIsPosting(true);
    await createStatus({
      image:     image     || undefined,
      text:      tab === "text" ? text : caption || undefined,
      textColor: tab === "text" ? textColor : undefined,
      textBg:    tab === "text" ? textBg    : undefined,
    });
    setIsPosting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h2 className="font-bold text-lg">Add Status</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300">
          <button
            onClick={() => setTab("photo")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${tab === "photo" ? "text-primary border-b-2 border-primary" : "text-base-content/50"}`}
          >
            <Image size={16} /> Photo
          </button>
          <button
            onClick={() => setTab("text")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${tab === "text" ? "text-primary border-b-2 border-primary" : "text-base-content/50"}`}
          >
            <Type size={16} /> Text
          </button>
        </div>

        <div className="p-5 space-y-4">
          {tab === "photo" ? (
            <>
              {/* Image picker */}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

              {image ? (
                <div className="relative">
                  <img src={image} className="w-full h-48 object-cover rounded-xl" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 btn btn-circle btn-xs btn-error"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-base-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <Image size={28} className="opacity-40" />
                  <span className="text-sm opacity-50">Tap to select photo</span>
                </button>
              )}

              {/* Optional caption */}
              <input
                type="text"
                placeholder="Add a caption..."
                className="input input-bordered w-full"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </>
          ) : (
            <>
              {/* Text preview */}
              <div
                className="w-full h-48 rounded-xl flex items-center justify-center p-4"
                style={{ background: textBg }}
              >
                <p
                  className="text-2xl font-bold text-center"
                  style={{ color: textColor }}
                >
                  {text || "Your text here..."}
                </p>
              </div>

              <textarea
                placeholder="Type your status..."
                className="textarea textarea-bordered w-full resize-none"
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
              />

              {/* Background color */}
              <div>
                <p className="text-xs opacity-50 mb-2 font-semibold uppercase">Background</p>
                <div className="flex gap-2 flex-wrap">
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextBg(c)}
                      className={`size-8 rounded-full border-2 transition-all ${textBg === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Text color */}
              <div>
                <p className="text-xs opacity-50 mb-2 font-semibold uppercase">Text Color</p>
                <div className="flex gap-2">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={`size-8 rounded-full border-2 transition-all ${textColor === c ? "border-primary scale-110" : "border-base-300"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Post button */}
          <button
            onClick={handlePost}
            disabled={isPosting || (!image && !text.trim())}
            className="btn btn-primary w-full gap-2"
          >
            {isPosting ? <span className="loading loading-spinner loading-sm" /> : <Send size={16} />}
            Post Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStatusModal;