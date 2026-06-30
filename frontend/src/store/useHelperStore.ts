import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useHelperStore = create<any>((set, get) => ({
  donors: [],
  isLoading: false,
  myLocation: null,

  // Get browser GPS location
  getMyLocation: (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          set({ myLocation: loc });
          resolve(loc);
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  },

  // Save my location + donor profile to backend
  saveDonorProfile: async (bloodGroup: string, isAvailableDonor: boolean) => {
    try {
      await axiosInstance.put("/auth/donor-profile", { bloodGroup, isAvailableDonor });

      // Also update location
      const loc = await get().getMyLocation();
      await axiosInstance.put("/auth/location", { latitude: loc.lat, longitude: loc.lng });

      toast.success("Donor profile updated!");
      return true;
    } catch (error) {
      toast.error("Failed to update. Allow location access.");
      return false;
    }
  },

  // Find nearby donors
  findDonors: async (bloodGroup: string) => {
    set({ isLoading: true });
    try {
      const loc = await get().getMyLocation();
      const res = await axiosInstance.get("/auth/blood-donors", {
        params: { bloodGroup, latitude: loc.lat, longitude: loc.lng, maxDistance: 50000 },
      });
      set({ donors: res.data });
    } catch (error: any) {
      toast.error("Could not load donors. Allow location access.");
      set({ donors: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));