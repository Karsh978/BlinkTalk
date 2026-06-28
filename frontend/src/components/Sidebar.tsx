import { useEffect, useState } from "react";
import { Plus, Search, UserPlus, Users, Camera } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useStatusStore } from "../store/useStatusStore";
import { formatLastSeen } from "../lib/utils";
import CreateGroupModal from "./CreateGroupModal";
import AddContactModal from "./AddContactModal";
import AddStatusModal from "./AddStatusModal";
import StatusViewer from "./StatusViewer";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, groups, getGroups, selectedGroup, setSelectedGroup, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const { statusGroups, getStatuses } = useStatusStore();

  const [search, setSearch]                   = useState("");
  const [showMenu, setShowMenu]               = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen]     = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen]   = useState(false);
  const [viewingGroup, setViewingGroup]             = useState<any>(null);

  useEffect(() => {
    getUsers();
    getGroups();
    getStatuses(); // ✅ load statuses
  }, []);

  const filteredUsers  = users.filter((u: any) => u.fullName?.toLowerCase().includes(search.toLowerCase()));
  const filteredGroups = groups.filter((g: any) => g.name?.toLowerCase().includes(search.toLowerCase()));

  // My own status group
  const myStatusGroup = statusGroups.find((g: any) => g.user._id === authUser?._id);
  // Others' status groups
  const othersGroups  = statusGroups.filter((g: any) => g.user._id !== authUser?._id);

  return (
    <aside className="h-full flex flex-col bg-white">

      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center relative">
        <h1 className="text-xl font-extrabold text-indigo-900">Messages</h1>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">
            <Plus size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-1 animate-fadeIn">
              <button onClick={() => { setIsStatusModalOpen(true); setShowMenu(false); }} className="w-full text-left p-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                <Camera size={16} /> My Status
              </button>
              <button onClick={() => { setIsContactModalOpen(true); setShowMenu(false); }} className="w-full text-left p-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                <UserPlus size={16} /> New Contact
              </button>
              <button onClick={() => { setIsGroupModalOpen(true); setShowMenu(false); }} className="w-full text-left p-2.5 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                <Users size={16} /> New Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Status circles row */}
      {statusGroups.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">

            {/* My status */}
            <button
              onClick={() => myStatusGroup ? setViewingGroup(myStatusGroup) : setIsStatusModalOpen(true)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className={`relative size-14 rounded-full p-0.5 ${myStatusGroup ? "bg-gradient-to-tr from-indigo-500 to-purple-500" : "bg-gray-200"}`}>
                <img src={authUser?.profilePic || "/avatar.png"} className="size-full rounded-full object-cover border-2 border-white" />
                {!myStatusGroup && (
                  <div className="absolute bottom-0 right-0 size-5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
                    <Plus size={10} color="white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-500 font-medium">My Status</span>
            </button>

            {/* Others' statuses */}
            {othersGroups.map((group: any) => (
              <button
                key={group.user._id}
                onClick={() => setViewingGroup(group)}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className={`size-14 rounded-full p-0.5 ${group.hasUnread ? "bg-gradient-to-tr from-indigo-500 to-purple-500" : "bg-gray-300"}`}>
                  <img src={group.user.profilePic || "/avatar.png"} className="size-full rounded-full object-cover border-2 border-white" />
                </div>
                <span className="text-[10px] text-gray-500 font-medium truncate w-14 text-center">
                  {group.user.fullName.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
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

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal</div>
        {filteredUsers.map((user: any) => (
          <button key={user._id} onClick={() => setSelectedUser(user)}
            className={`w-[92%] mx-auto mb-1 flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedUser?._id === user._id ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50"}`}
          >
            <div className="relative shrink-0">
              <img src={user.profilePic || "/avatar.png"} className="size-12 rounded-full object-cover border-2 border-white shadow-sm" />
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

        {filteredUsers.length === 0 && !isUsersLoading && (
          <div className="text-center py-10 text-gray-400">
            <UserPlus size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No contacts yet</p>
            <p className="text-xs mt-1">Tap + to add someone</p>
          </div>
        )}

        <div className="px-5 py-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Groups</div>
        {filteredGroups.map((group: any) => (
          <button key={group._id} onClick={() => setSelectedGroup(group)}
            className={`w-[92%] mx-auto mb-1 flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedGroup?._id === group._id ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50"}`}
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

      {/* Modals */}
      <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <AddContactModal  isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <AddStatusModal   isOpen={isStatusModalOpen}  onClose={() => { setIsStatusModalOpen(false); getStatuses(); }} />

      {/* Status viewer fullscreen */}
      {viewingGroup && (
        <StatusViewer group={viewingGroup} onClose={() => { setViewingGroup(null); getStatuses(); }} />
      )}
    </aside>
  );
};

export default Sidebar;