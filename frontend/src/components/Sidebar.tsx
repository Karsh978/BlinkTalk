import { useEffect, useState } from "react";
import { Plus, Search, UserPlus, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatLastSeen } from "../lib/utils";
import CreateGroupModal from "./CreateGroupModal";
import AddContactModal from "./AddContactModal"; // Make sure this import matches your file structure

const Sidebar = () => {
  const { 
    getUsers, 
    users, 
    selectedUser, 
    setSelectedUser, 
    groups, 
    getGroups, 
    selectedGroup, 
    setSelectedGroup, 
    isUsersLoading 
  } = useChatStore();
  
  const { onlineUsers } = useAuthStore();
  const [search, setSearch] = useState("");
  
  // Dropdown & Modal States
  const [showMenu, setShowMenu] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => { 
    getUsers(); 
    getGroups(); 
  }, [getUsers, getGroups]);

  const filteredUsers = users.filter((u: any) => 
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g: any) => 
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="h-full flex flex-col bg-white">
      {/* Header Area */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center relative">
        <h1 className="text-xl font-extrabold text-indigo-900">Messages</h1>
        
        {/* Action Menu Trigger Container */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center"
            title="Actions"
          >
            <Plus size={20} />
          </button>

          {/* Action Menu Dropdown */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-1 index-50 animate-fadeIn">
              <button 
                onClick={() => { setIsContactModalOpen(true); setShowMenu(false); }}
                className="w-full text-left p-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors"
              >
                <UserPlus size={16} /> New Contact
              </button>
              <button 
                onClick={() => { setIsGroupModalOpen(true); setShowMenu(false); }}
                className="w-full text-left p-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors"
              >
                <Users size={16} /> New Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            className="w-full bg-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 ring-indigo-500/20" 
            placeholder="Search..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Roster / Feeds List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Personal Direct Messages Section */}
        <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal</div>
        {filteredUsers.map((user: any) => (
          <button 
            key={user._id} 
            onClick={() => setSelectedUser(user)} 
            className={`w-[92%] mx-auto mb-1 flex items-center gap-3 p-3 rounded-2xl transition-all ${
              selectedUser?._id === user._id ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50"
            }`}
          >
            <div className="relative shrink-0">
              <img 
                src={user.profilePic || "/avatar.png"} 
                className="size-12 rounded-full object-cover border-2 border-white shadow-sm" 
                alt={user.fullName}
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0.5 right-0.5 size-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="text-left overflow-hidden">
              <div className="font-bold text-gray-800 truncate">{user.fullName}</div>
              <div className="text-[11px] text-gray-400 truncate">
                {onlineUsers.includes(user._id) ? "Active Now" : formatLastSeen(user.lastSeen)}
              </div>
            </div>
          </button>
        ))}

        {/* Channels/Groups Section */}
        <div className="px-5 py-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Groups</div>
        {filteredGroups.map((group: any) => (
          <button 
            key={group._id} 
            onClick={() => setSelectedGroup(group)} 
            className={`w-[92%] mx-auto mb-1 flex items-center gap-3 p-3 rounded-2xl transition-all ${
              selectedGroup?._id === group._id ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50"
            }`}
          >
            <div className="size-12 rounded-2xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xl shrink-0">
              {group.name[0]}
            </div>
            <div className="text-left overflow-hidden">
              <div className="font-bold text-gray-800 truncate">{group.name}</div>
              <div className="text-[11px] text-gray-400 truncate">{group.members.length} members</div>
            </div>
          </button>
        ))}
      </div>

      {/* Dynamic Overlay Modals */}
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <AddContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </aside>
  );
};

export default Sidebar;