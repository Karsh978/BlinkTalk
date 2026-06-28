import { useState } from "react";
import { createPortal } from "react-dom";
import { useChatStore } from "../store/useChatStore";
import { X, Users, Check } from "lucide-react";

const CreateGroupModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { users, createGroup } = useChatStore(); // users = your contacts only ✅

  if (!isOpen) return null;

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length < 1) return; // ✅ min 1 other person
    await createGroup({ name: groupName, members: selectedMembers });
    onClose();
    setGroupName("");
    setSelectedMembers([]);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600 w-5 h-5" />
            <h2 className="font-bold text-indigo-900">Create New Group</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-indigo-100">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Group name input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Group Name</label>
            <input
              type="text"
              placeholder="Enter group name..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-indigo-400"
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Member selector — only from YOUR contacts */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">
              Add Members ({selectedMembers.length} selected)
            </label>

            {users.length === 0 ? (
              // No contacts yet
              <div className="text-center py-8 text-gray-400">
                <Users size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No contacts to add</p>
                <p className="text-xs mt-1">Add contacts first from the sidebar</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {users.map((user: any) => (
                  <div
                    key={user._id}
                    onClick={() => toggleMember(user._id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedMembers.includes(user._id)
                        ? "bg-indigo-50 border border-indigo-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        className="size-9 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-800">{user.fullName}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedMembers.includes(user._id)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}>
                      {selectedMembers.includes(user._id) && (
                        <Check className="text-white w-3 h-3" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMembers.length < 1}
            className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateGroupModal;