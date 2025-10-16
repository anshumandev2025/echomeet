import { useState } from "react";
import JoinMeeting from "../components/meeting/joinMeeting/JoinMeeting";
import LoobyRoom from "../components/meeting/lobbyRoom/LoobyRoom";
import MeetingRoom from "../components/meeting/meetingRoom/MeetingRoom";
import useCurrentMeetingState from "../store/meetingState";

const MeetingPage = () => {
  const { meetingState } = useCurrentMeetingState();
  const [params, setParams] = useState({
    encoding: [
      { rid: "r0", maxBitrate: 100000, scalabilityMode: "S1T3" }, // Lowest quality layer
      { rid: "r1", maxBitrate: 300000, scalabilityMode: "S1T3" }, // Middle quality layer
      { rid: "r2", maxBitrate: 900000, scalabilityMode: "S1T3" }, // Highest quality layer
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 }, // Initial bitrate
  });
  const [device, setDevice] = useState<any>(null); // mediasoup Device
  const [rtpCapabilities, setRtpCapabilities] = useState<any>(null); // RTP Capabilities for the device
  const [producerTransport, setProducerTransport] = useState<any>(null); // Transport for sending media
  const [consumerTransport, setConsumerTransport] = useState<any>(null);
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
