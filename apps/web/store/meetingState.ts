import { create } from "zustand";

interface meetingStateInterface {
  currentMeetingStep: string;
  updateCurrentMeetingStep: (step: string) => void;
}

const useMeetingState = create<meetingStateInterface>()((set) => ({
  currentMeetingStep: "lobby-room",
  updateCurrentMeetingStep: (step) =>
    set((state) => ({ currentMeetingStep: step })),
}));

export default useMeetingState;
