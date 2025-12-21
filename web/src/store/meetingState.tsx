import { create } from "zustand";

type MeetingState = "join" | "lobby" | "in-meeting";
type PermissionsType = { camera: boolean; mic: boolean };
interface CurrentMeetingState {
  meetingState: MeetingState;
  roomName: string;
  localStream: MediaStream | null;
  permissions: PermissionsType;
  updateMeetingState: (newState: MeetingState) => void;
  setCurrentRoomName: (room: string) => void;
  setLocalStream: (stream: MediaStream) => void;
  setPermissions: (newPermissios: PermissionsType) => void;
}

const useCurrentMeetingState = create<CurrentMeetingState>((set) => ({
  meetingState: "join",
  roomName: "",
  localStream: null,
  permissions: { camera: false, mic: false },
  updateMeetingState: (newState) => set({ meetingState: newState }),
  setCurrentRoomName: (room) => set({ roomName: room }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setPermissions: (newPermissions) =>
    set({
      permissions: { camera: newPermissions.camera, mic: newPermissions.mic },
    }),
}));

export default useCurrentMeetingState;
