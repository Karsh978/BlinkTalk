import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
// Import useThemeStore to prevent the runtime crash
import { useThemeStore } from "./useThemeStore"; 
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
      const res = await axiosInstance.get("/auth/contacts");
      set({ users: res.data });
    } catch (error) {
      toast.error("Error loading contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
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
  socket.off("messageDeletedEveryone");

  socket.on("newMessage", (newMessage: any) => {
    // Notification
    const { notificationsEnabled, notificationSound, notificationPreview } = useThemeStore.getState();
    const currentUser = get().selectedUser;
    const isChatOpen = currentUser?._id?.toString() === newMessage.senderId?.toString();

    if (notificationsEnabled && (!isChatOpen || !document.hasFocus())) {
      if (notificationSound) {
        new Audio("/notification.mp3").play().catch(() => {});
      }
      if (Notification.permission === "granted") {
        new Notification("BlinkTalk", {
          body: notificationPreview
            ? (newMessage.text || (newMessage.image ? "📷 Photo" : newMessage.audio ? "🎤 Voice message" : "New message"))
            : "New message",
          icon: "/logo.png",
        });
      }
    }

    // ✅ Har baar get() se fresh selectedUser lo
    const activeUser = get().selectedUser;
    if (activeUser?._id?.toString() === newMessage.senderId?.toString()) {
      set({ messages: [...get().messages, newMessage] });
    }
  });

  socket.on("newGroupMessage", (msg: any) => {
    const { selectedGroup } = get();
    if (selectedGroup?._id?.toString() === msg.groupId?.toString()) {
      set({ messages: [...get().messages, msg] });
    }
  });

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
      
      if (type === "me") {
        set({ 
          messages: get().messages.filter((m: any) => m._id !== messageId) 
        });
      } else if (type === "everyone") {
        // Optimistic local update for the sender
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

  clearChat: async (userId: string) => {
  try {
    await axiosInstance.delete(`/messages/clear/${userId}`);
    set({ messages: [] }); // Local screen turant clear
    toast.success("Chat cleared");
  } catch (error: any) {
    toast.error("Failed to clear chat");
  }
},

  addContact: async (contactId: string) => {
    try {
      const res = await axiosInstance.post("/auth/add-contact", { contactId });
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
      set({ groups: [...get().groups, res.data] });
      toast.success("Group created!");
    } catch (error) {
      toast.error("Failed to create group");
    }
  },
}));