import { create } from "zustand";

type MeetingState = "join" | "lobby" | "in-meeting";

interface CurrentMeetingState {
  meetingState: MeetingState;
  roomName: string;
  localStream: MediaStream | null;
  updateMeetingState: (newState: MeetingState) => void;
  setCurrentRoomName: (room: string) => void;
  setLocalStream: (stream: MediaStream) => void;
}

const useCurrentMeetingState = create<CurrentMeetingState>((set) => ({
  meetingState: "join",
  roomName: "",
  localStream: null,
  updateMeetingState: (newState) => set({ meetingState: newState }),
  setCurrentRoomName: (room) => set({ roomName: room }),
  setLocalStream: (stream) => set({ localStream: stream }),
}));

export default useCurrentMeetingState;
