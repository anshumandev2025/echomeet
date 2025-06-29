import JoinMeeting from "../components/meeting/JoinMeeting";
import LoobyRoom from "../components/meeting/LoobyRoom";
import MeetingRoom from "../components/meeting/MeetingRoom";
import useCurrentMeetingState from "../store/meetingState";

const MeetingPage = () => {
  const { meetingState } = useCurrentMeetingState();
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {meetingState == "join" ? (
        <JoinMeeting />
      ) : meetingState == "lobby" ? (
        <LoobyRoom />
      ) : (
        <MeetingRoom />
      )}
    </div>
  );
};

export default MeetingPage;
