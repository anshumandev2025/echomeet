import { useState } from "react";
import JoinMeeting from "../components/meeting/joinMeeting/JoinMeeting";
import LoobyRoom from "../components/meeting/lobbyRoom/LoobyRoom";
import MeetingRoom from "../components/meeting/meetingRoom/MeetingRoom";
import useCurrentMeetingState from "../store/meetingState";
import type { Participant } from "../types/MediaTypes";
import { socket } from "../socket/SocketConnect";

const MeetingPage = () => {
  const { meetingState, localStream } = useCurrentMeetingState();
  const [localParticipant, setLocalParticipant] = useState<Participant>({
    id: "local",
    name: "You",
    socketId: socket.id || null,
    stream: localStream,
    videoEnabled: true,
    audioEnabled: true,
    isSpeaking: false,
  });
  return (
    <div className="bg-linear-to-br from-gray-900 via-gray-800 to-black">
      {meetingState == "join" ? (
        <JoinMeeting />
      ) : meetingState == "lobby" ? (
        <LoobyRoom setLocalParticipant={setLocalParticipant} />
      ) : (
        <MeetingRoom
          setLocalParticipant={setLocalParticipant}
          localParticipant={localParticipant}
        />
      )}
    </div>
  );
};

export default MeetingPage;
