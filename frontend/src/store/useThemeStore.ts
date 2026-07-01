import { create } from "zustand";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: "small" | "medium" | "large";
  setFontSize: (size: "small" | "medium" | "large") => void;
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  notificationSound: boolean;
  setNotificationSound: (val: boolean) => void;
  notificationPreview: boolean;
  setNotificationPreview: (val: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
  setTheme: (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },

  fontSize: (localStorage.getItem("chat-fontsize") as any) || "medium",
  setFontSize: (size) => {
    localStorage.setItem("chat-fontsize", size);
    set({ fontSize: size });
  },

  wallpaper: localStorage.getItem("chat-wallpaper") || "none",
  setWallpaper: (wallpaper) => {
    localStorage.setItem("chat-wallpaper", wallpaper);
    set({ wallpaper });
  },

  notificationsEnabled: localStorage.getItem("notif-enabled") !== "false",
  setNotificationsEnabled: (val) => {
    localStorage.setItem("notif-enabled", String(val));
    set({ notificationsEnabled: val });
  },

  notificationSound: localStorage.getItem("notif-sound") !== "false",
  setNotificationSound: (val) => {
    localStorage.setItem("notif-sound", String(val));
    set({ notificationSound: val });
  },

  notificationPreview: localStorage.getItem("notif-preview") !== "false",
  setNotificationPreview: (val) => {
    localStorage.setItem("notif-preview", String(val));
    set({ notificationPreview: val });
  },
}));