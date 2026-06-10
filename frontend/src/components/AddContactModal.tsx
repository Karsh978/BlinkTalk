import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, UserPlus, Search, Send } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const AddContactModal = ({ isOpen, onClose }: any) => {
  const [query, setQuery] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const { setSelectedUser } = useChatStore();

  if (!isOpen) return null;

  const handleSearch = async () => {
    try {
      const res = await axiosInstance.get(`/auth/find-contact?contact=${query}`);
      setFoundUser(res.data);
    } catch (error) {
      setFoundUser(null);
      alert("No user found!");
    }
  };

  const startChat = () => {
    setSelectedUser(foundUser);
    onClose();
    setFoundUser(null);
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-primary/5">
          <h2 className="font-bold flex items-center gap-2"><UserPlus size={18} /> Add New Contact</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><X /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Enter Email or Phone..." 
              className="input input-bordered w-full pr-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-xs h-8">
              <Search size={14} />
            </button>
          </div>

          {foundUser && (
            <div className="flex items-center justify-between p-3 bg-base-200 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <img src={foundUser.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover" />
                <div className="text-sm">
                   <div className="font-bold">{foundUser.fullName}</div>
                   <div className="opacity-60 text-xs">{foundUser.email}</div>
                </div>
              </div>
              <button onClick={startChat} className="btn btn-primary btn-sm btn-circle">
                 <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AddContactModal;