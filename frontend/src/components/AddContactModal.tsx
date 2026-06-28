import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, UserPlus, Search, MessageCircle, Loader2 } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const AddContactModal = ({ isOpen, onClose }: any) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { setSelectedUser, addContact, users } = useChatStore();

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResults([]);
    try {
      const res = await axiosInstance.get(`/auth/search?query=${query}`);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (user: any) => {
    setAddingId(user._id);
    const success = await addContact(user._id);
    setAddingId(null);
    if (success) {
      setSelectedUser(user);
      onClose();
      setQuery("");
      setResults([]);
    }
  };

  const handleChat = (user: any) => {
    setSelectedUser(user);
    onClose();
    setQuery("");
    setResults([]);
  };

  // Check if already in contacts
  const isContact = (id: string) => users.some((u: any) => u._id === id);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
          <h2 className="font-bold text-indigo-900 flex items-center gap-2">
            <UserPlus size={18} /> Add New Contact
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-indigo-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 ring-indigo-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.length === 0 && !isSearching && query && (
              <p className="text-center text-sm text-gray-400 py-4">No users found</p>
            )}

            {results.map((user: any) => {
              const already = isContact(user._id);
              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{user.fullName}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </div>
                  </div>

                  {already ? (
                    // Already a contact → just open chat
                    <button
                      onClick={() => handleChat(user)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200"
                    >
                      <MessageCircle size={13} /> Chat
                    </button>
                  ) : (
                    // Not yet added → show Add button
                    <button
                      onClick={() => handleAdd(user)}
                      disabled={addingId === user._id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {addingId === user._id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <UserPlus size={13} />
                      }
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;