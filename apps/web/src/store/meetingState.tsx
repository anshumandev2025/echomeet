import { create } from "zustand";

type MeetingState = "join" | "lobby" | "in-meeting";

interface CurrentMeetingState {
  meetingState: MeetingState;
  updateMeetingState: (newState: MeetingState) => void;
}

const useCurrentMeetingState = create<CurrentMeetingState>((set) => ({
  meetingState: "join",
  updateMeetingState: (newState) => set({ meetingState: newState }),
}));

export default useCurrentMeetingState;
