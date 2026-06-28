import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useStatusStore = create<any>((set, get) => ({
  statusGroups: [],   // grouped by user
  isLoading: false,

  getStatuses: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/status");
      set({ statusGroups: res.data });
    } catch {
      toast.error("Could not load statuses");
    } finally {
      set({ isLoading: false });
    }
  },

  createStatus: async (data: { image?: string; text?: string; textColor?: string; textBg?: string }) => {
    try {
      await axiosInstance.post("/status", data);
      toast.success("Status posted!");
      get().getStatuses();
    } catch {
      toast.error("Failed to post status");
    }
  },

  viewStatus: async (statusId: string) => {
    try {
      await axiosInstance.put(`/status/view/${statusId}`);
      // Update local state — mark as read
      set({
        statusGroups: get().statusGroups.map((g: any) => ({
          ...g,
          statuses: g.statuses.map((s: any) =>
            s._id === statusId ? { ...s, isSeen: true } : s
          ),
          hasUnread: g.statuses.some(
            (s: any) => s._id !== statusId && !s.isSeen
          ),
        })),
      });
    } catch {
      console.log("Error marking status viewed");
    }
  },

  deleteStatus: async (statusId: string) => {
    try {
      await axiosInstance.delete(`/status/${statusId}`);
      toast.success("Status deleted");
      get().getStatuses();
    } catch {
      toast.error("Failed to delete");
    }
  },
}));