import { useState } from "react";
import { createPortal } from "react-dom"; // React Portal ka use karenge
import { useChatStore } from "../store/useChatStore";
import { X, Users, Check, Plus } from "lucide-react";

const CreateGroupModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { users, createGroup } = useChatStore();

  if (!isOpen) return null;

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    await createGroup({ name: groupName, members: selectedMembers });
    onClose();
    setGroupName("");
    setSelectedMembers([]);
  };

  // createPortal se modal hamesha screen ke upar dikhega
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 1. Backdrop (Pura screen cover karega) */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* 2. Modal Box (Fixed width and height) */}
      <div className="relative bg-base-100 w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-base-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="text-primary w-5 h-5" />
            <h2 className="font-bold text-lg">Create Group</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><X size={20}/></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase opacity-50">Group Name</label>
            <input
              type="text"
              placeholder="Enter group name..."
              className="input input-bordered w-full"
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase opacity-50">Select Members ({selectedMembers.length})</label>
            <div className="space-y-1">
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleMember(user._id)}
                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                    selectedMembers.includes(user._id) ? "bg-primary/10 border border-primary/30" : "hover:bg-base-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover border" />
                    <span className="font-medium text-sm">{user.fullName}</span>
                  </div>
                  <div className={`size-5 rounded-full border flex items-center justify-center ${selectedMembers.includes(user._id) ? "bg-primary border-primary" : "border-base-300"}`}>
                    {selectedMembers.includes(user._id) && <Check className="text-white w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300 flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
          <button 
            onClick={handleCreate} 
            disabled={!groupName.trim() || selectedMembers.length < 2}
            className="btn btn-primary flex-1"
          >
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body // <--- YE ZAROORI HAI
  );
};

export default CreateGroupModal;