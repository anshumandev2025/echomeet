import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { motion, AnimatePresence } from "motion/react";
import useCurrentMeetingState from "../../../store/meetingState";
import MeetingControls from "./MeetingControl";
import MeetingHeader from "./MeetingHeader";
import VideoGrid from "./VideoGrid";
import { socket } from "../../../socket/SocketConnect";

// Types
interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSpeaking: boolean;
}

const MeetingRoom = () => {
  const { roomName, localStream } = useCurrentMeetingState();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<Participant>({
    id: "local",
    name: "You",
    stream: localStream,
    videoEnabled: true,
    audioEnabled: true,
    isSpeaking: false,
  });

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isControlsHovered, setIsControlsHovered] = useState(false);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const { updateMeetingState } = useCurrentMeetingState();
  // Initialize demo participants
  useEffect(() => {
    const demoParticipants: Participant[] = [
      {
        id: "2",
        name: "Alice Johnson",
        stream: null,
        videoEnabled: true,
        audioEnabled: true,
        isSpeaking: false,
      },
      {
        id: "3",
        name: "Bob Smith",
        stream: null,
        videoEnabled: false,
        audioEnabled: true,
        isSpeaking: false,
      },
      {
        id: "4",
        name: "Carol Wilson",
        stream: null,
        videoEnabled: true,
        audioEnabled: false,
        isSpeaking: true,
      },
    ];

    demoParticipants.forEach((participant, index) => {
      setTimeout(() => {
        setParticipants((prev) => [...prev, participant]);
      }, (index + 1) * 1000);
    });
  }, []);

  // Auto-hide controls logic
  useEffect(() => {
    const resetHideTimer = () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      setControlsVisible(true);

      if (!isControlsHovered) {
        hideControlsTimeoutRef.current = setTimeout(() => {
          setControlsVisible(false);
        }, 3000);
      }
    };

    const handleMouseMove = () => resetHideTimer();
    const handleMouseLeave = () => resetHideTimer();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    resetHideTimer();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isControlsHovered]);

  // Switch to fixed sizes when there are many participants
  //   useEffect(() => {
  //     const totalParticipants = participants.length + 1; // +1 for local participant
  //     setUseFixedSizes(totalParticipants > 8);
  //   }, [participants.length]);

  const toggleVideo = () => {
    setLocalParticipant((prev) => ({
      ...prev,
      videoEnabled: !prev.videoEnabled,
    }));

    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !localParticipant.videoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setLocalParticipant((prev) => ({
      ...prev,
      audioEnabled: !prev.audioEnabled,
    }));

    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !localParticipant.audioEnabled;
      }
    }
  };

  const handleLeaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    socket.disconnect();
    updateMeetingState("join");
  };

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: `User ${participants.length + 2}`,
      stream: null,
      videoEnabled: Math.random() > 0.3,
      audioEnabled: Math.random() > 0.2,
      isSpeaking: Math.random() > 0.8,
    };
    setParticipants((prev) => [...prev, newParticipant]);
    message.success(`${newParticipant.name} joined the meeting`);
  };

  const removeParticipant = () => {
    if (participants.length > 0) {
      const removed = participants[participants.length - 1];
      setParticipants((prev) => prev.slice(0, -1));
      message.info(`${removed.name} left the meeting`);
    }
  };

  const allParticipants = [localParticipant, ...participants];

  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <MeetingHeader
        roomName={roomName}
        participantCount={allParticipants.length}
        isVisible={controlsVisible}
      />

      {/* Main video grid */}
      <div className="h-full pt-20 pb-24">
        <VideoGrid
          participants={participants}
          localParticipant={localParticipant}
        />
      </div>

      {/* Bottom controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute mx-10 bottom-0 left-0 right-0 z-30"
            onMouseEnter={() => setIsControlsHovered(true)}
            onMouseLeave={() => setIsControlsHovered(false)}
          >
            <MeetingControls
              videoEnabled={localParticipant.videoEnabled}
              audioEnabled={localParticipant.audioEnabled}
              onToggleVideo={toggleVideo}
              onToggleAudio={toggleAudio}
              onLeaveCall={handleLeaveCall}
              onAddParticipant={addParticipant}
              onRemoveParticipant={removeParticipant}
              canRemoveParticipant={participants.length > 0}
              showDemoControls={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingRoom;
