import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

interface CallStore {
  // Outgoing call state
  isCalling: boolean;
  callType: "audio" | "video" | null;
  callReceiver: any;

  // Incoming call state
  incomingCall: any;

  // Active call state
  isInCall: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;

  // WebRTC
  peerConnection: RTCPeerConnection | null;

  // Actions
  startCall: (receiver: any, type: "audio" | "video") => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  handleIncomingCall: (data: any) => void;
  handleCallAnswered: (data: any) => void;
  handleIceCandidate: (data: any) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useCallStore = create<CallStore>((set, get) => ({
  isCalling:      false,
  callType:       null,
  callReceiver:   null,
  incomingCall:   null,
  isInCall:       false,
  localStream:    null,
  remoteStream:   null,
  isMuted:        false,
  isCameraOff:    false,
  peerConnection: null,

  // ── Start outgoing call ──
  startCall: async (receiver, type) => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket) return;

    // Get local media
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // When remote track arrives
    pc.ontrack = (event) => {
      set({ remoteStream: event.streams[0] });
    };

    // ICE candidate — send to receiver
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: receiver._id,
          candidate: event.candidate,
        });
      }
    };

    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Emit call to receiver
    socket.emit("callUser", {
      to: receiver._id,
      offer,
      callType: type,
      callerName: authUser.fullName,
      callerPic:  authUser.profilePic,
    });

    set({
      isCalling:      true,
      callType:       type,
      callReceiver:   receiver,
      localStream:    stream,
      peerConnection: pc,
    });
  },

  // ── Answer incoming call ──
  answerCall: async () => {
    const socket = useAuthStore.getState().socket;
    const { incomingCall } = get();
    if (!socket || !incomingCall) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: incomingCall.callType === "video",
    });

    const pc = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      set({ remoteStream: event.streams[0] });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: incomingCall.from,
          candidate: event.candidate,
        });
      }
    };

    // Set remote description from caller's offer
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

    // Create and send answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answerCall", {
      to: incomingCall.from,
      answer,
    });

    set({
      isInCall:       true,
      isCalling:      false,
      incomingCall:   null,
      localStream:    stream,
      callType:       incomingCall.callType,
      peerConnection: pc,
    });
  },

  // ── Reject incoming call ──
  rejectCall: () => {
    const socket = useAuthStore.getState().socket;
    const { incomingCall } = get();
    if (socket && incomingCall) {
      socket.emit("rejectCall", { to: incomingCall.from });
    }
    set({ incomingCall: null });
  },

  // ── End active call ──
  endCall: () => {
    const socket = useAuthStore.getState().socket;
    const { peerConnection, localStream, callReceiver, incomingCall } = get();

    const targetId = callReceiver?._id || incomingCall?.from;
    if (socket && targetId) {
      socket.emit("endCall", { to: targetId });
    }

    // Cleanup tracks
    localStream?.getTracks().forEach((t) => t.stop());
    peerConnection?.close();

    set({
      isCalling:      false,
      isInCall:       false,
      incomingCall:   null,
      callType:       null,
      callReceiver:   null,
      localStream:    null,
      remoteStream:   null,
      peerConnection: null,
      isMuted:        false,
      isCameraOff:    false,
    });
  },

  // ── Toggle mute ──
  toggleMute: () => {
    const { localStream, isMuted } = get();
    localStream?.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    set({ isMuted: !isMuted });
  },

  // ── Toggle camera ──
  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    localStream?.getVideoTracks().forEach((t) => (t.enabled = isCameraOff));
    set({ isCameraOff: !isCameraOff });
  },

  // ── Socket event handlers ──
  handleIncomingCall: (data) => {
    set({ incomingCall: data });
  },

  handleCallAnswered: async (data) => {
    const { peerConnection } = get();
    if (peerConnection) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      set({ isInCall: true, isCalling: false });
    }
  },

  handleIceCandidate: async (data) => {
    const { peerConnection } = get();
    if (peerConnection && data.candidate) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (e) {}
    }
  },
}));