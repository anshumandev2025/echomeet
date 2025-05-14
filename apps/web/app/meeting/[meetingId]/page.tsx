"use client";
import LobbyRoom from "@/components/LobbyRoom";
import MeetingRoom from "@/components/MeetingRoom";
import useMeetingState from "@/store/meetingState";
const page = () => {
  const { currentMeetingStep } = useMeetingState();
  return (
    <div className="flex justify-center items-center h-screen w-full">
      {currentMeetingStep == "lobby-room" ? <LobbyRoom /> : <MeetingRoom />}
    </div>
  );
};

export default page;
