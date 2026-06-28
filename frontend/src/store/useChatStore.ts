import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create<any>((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
  set({ isUsersLoading: true });
  try {
    const res = await axiosInstance.get("/auth/contacts"); // ✅ only my contacts
    set({ users: res.data });
  } catch (error) {
    toast.error("Error loading contacts");
  } finally {
    set({ isUsersLoading: false });
  }
},

 getGroups: async () => {
  try {
    const res = await axiosInstance.get("/groups"); // ✅ correct endpoint
    set({ groups: res.data || [] });
  } catch (error) {
    console.error("Error loading groups:", error);
  }
},

  setSelectedUser: (user: any) => {
    if (get().selectedUser?._id === user?._id) return;
    set({ selectedUser: user, selectedGroup: null, messages: [] });
  },

  setSelectedGroup: (group: any) => {
    if (get().selectedGroup?._id === group?._id) return;
    set({ selectedGroup: group, selectedUser: null, messages: [] });
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) { 
      toast.error("Messages not loaded"); 
    } finally { 
      set({ isMessagesLoading: false }); 
    }
  },

  getGroupMessages: async (groupId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
      set({ messages: res.data });
    } catch (error) { 
      console.error("Group messages error:", error); 
    } finally { 
      set({ isMessagesLoading: false }); 
    }
  },

  sendMessage: async (data: any) => {
    const { selectedUser, selectedGroup, messages } = get();
    try {
      const url = selectedUser ? `/messages/send/${selectedUser._id}` : `/messages/send/group/${selectedGroup._id}`;
      const res = await axiosInstance.post(url, data);
      set({ messages: [...messages, res.data] });
    } catch (error) { 
      toast.error("Failed to send"); 
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("messageDeletedEveryone"); // Cleanup old listener

    socket.on("newMessage", (msg: any) => {
      const { selectedUser } = get();
      if (selectedUser && msg.senderId === selectedUser._id) {
        set({ messages: [...get().messages, msg] });
      }
    });

    socket.on("newGroupMessage", (msg: any) => {
      const { selectedGroup } = get();
      if (selectedGroup && msg.groupId === selectedGroup._id) {
        set({ messages: [...get().messages, msg] });
      }
    });

    // Updated real-time listener for "Delete for Everyone"
    socket.on("messageDeletedEveryone", (messageId: string) => {
      set({
        messages: get().messages.map((m: any) =>
          m._id === messageId 
            ? { ...m, text: "This message was deleted", isDeleted: true, image: null, audio: null } 
            : m
        ),
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("newGroupMessage");
      socket.off("messageDeletedEveryone");
    }
  },

  deleteMessage: async (messageId: string, type: "me" | "everyone") => {
    try {
      await axiosInstance.post(`/messages/delete/${messageId}`, { type });
      
      // Local state update
      if (type === "me") {
        // "Delete for me" ke liye screen se message hata do
        set({ 
          messages: get().messages.filter((m: any) => m._id !== messageId) 
        });
      } else if (type === "everyone") {
        // "Delete for everyone" ke liye sender ki screen par bhi placeholder show karo
        set({
          messages: get().messages.map((m: any) =>
            m._id === messageId 
              ? { ...m, text: "This message was deleted", isDeleted: true, image: null, audio: null } 
              : m
          ),
        });
      }
      
      toast.success("Message removed");
    } catch (error) {
      console.error("Delete message error:", error);
      toast.error("Failed to delete message");
    }
  },


  addContact: async (contactId: string) => {
  try {
    const res = await axiosInstance.post("/auth/add-contact", { contactId });
    // Add to local list immediately
    set({ users: [...get().users, res.data] });
    toast.success("Contact added!");
    return true;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to add contact");
    return false;
  }
},

  getRecentChats: async () => {
    try {
      const res = await axiosInstance.get("/messages/conversations");
      set({ users: res.data });
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  },

  createGroup: async ({ name, members }: { name: string; members: string[] }) => {
  try {
    const res = await axiosInstance.post("/groups/create", { name, members });
    // Add new group to local list instantly
    set({ groups: [...get().groups, res.data] });
    toast.success("Group created!");
  } catch (error) {
    toast.error("Failed to create group");
  }
},
}));