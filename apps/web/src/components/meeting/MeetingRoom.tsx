import React, { useState, useEffect, useRef } from "react";
import { Button, Tooltip, message } from "antd";
import { motion, AnimatePresence } from "motion/react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  MoreHorizontal,
  Monitor,
  UserX,
} from "lucide-react";
import useCurrentMeetingState from "../../store/meetingState";

// --- Types ---
interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSpeaking: boolean;
}

interface ParticipantVideoProps {
  participant: Participant;
  isLocal?: boolean;
  className?: string;
}

// --- Utility ---
const calculateGridLayout = (participantCount: number) => {
  if (participantCount <= 1) return { cols: 1, rows: 1 };
  if (participantCount <= 2) return { cols: 2, rows: 1 };
  if (participantCount <= 4) return { cols: 2, rows: 2 };
  if (participantCount <= 6) return { cols: 3, rows: 2 };
  if (participantCount <= 9) return { cols: 3, rows: 3 };
  if (participantCount <= 12) return { cols: 4, rows: 3 };
  if (participantCount <= 16) return { cols: 4, rows: 4 };
  return { cols: 5, rows: Math.ceil(participantCount / 5) };
};

// --- Participant Video ---
const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  isLocal = false,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-lg border-2 ${
        isLocal ? "border-green-500" : "border-gray-700"
      } ${className}`}
    >
      {participant.videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl font-bold">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium">{participant.name}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
            {isLocal ? "You" : participant.name}
          </span>
          {isLocal && (
            <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">
              LOCAL
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!participant.audioEnabled && (
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <MicOff size={12} className="text-white" />
            </div>
          )}
          {!participant.videoEnabled && (
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <VideoOff size={12} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {participant.isSpeaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 border-4 border-green-400 rounded-xl pointer-events-none"
          style={{
            boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
          }}
        />
      )}
    </motion.div>
  );
};

// --- Meeting Room ---
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
      setTimeout(
        () => {
          setParticipants((prev) => [...prev, participant]);
        },
        (index + 1) * 1000
      );
    });
  }, []);

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

  const allParticipants = [localParticipant, ...participants];
  const { cols, rows } = calculateGridLayout(allParticipants.length);

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
  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: controlsVisible ? 1 : 0,
          y: controlsVisible ? 0 : -20,
        }}
        className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4"
      >
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-lg font-semibold">Meeting Room</h1>
            <p className="text-sm text-gray-300">Room: {roomName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users size={16} />
            <span>{allParticipants.length} participants</span>
          </div>
        </div>
      </motion.div>

      {/* Main video grid */}
      <div className="h-full p-4 pt-20 pb-24">
        <div
          className="h-full grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          <AnimatePresence mode="popLayout">
            {allParticipants.map((participant, index) => (
              <ParticipantVideo
                key={participant.id}
                participant={participant}
                isLocal={participant.id === "local"}
                className="min-h-0"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom controls */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 z-30"
            onMouseEnter={() => setIsControlsHovered(true)}
            onMouseLeave={() => setIsControlsHovered(false)}
          >
            <div className="bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center justify-center">
                <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl border border-gray-700">
                  <div className="flex items-center gap-4">
                    {/* Video toggle */}
                    <Tooltip
                      title={
                        localParticipant.videoEnabled
                          ? "Turn off camera"
                          : "Turn on camera"
                      }
                    >
                      <Button
                        shape="circle"
                        size="large"
                        onClick={toggleVideo}
                        className={`${
                          localParticipant.videoEnabled
                            ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            : "bg-red-600 border-red-600 text-white hover:bg-red-700"
                        } w-12 h-12 flex items-center justify-center`}
                        icon={
                          localParticipant.videoEnabled ? (
                            <Video size={20} />
                          ) : (
                            <VideoOff size={20} />
                          )
                        }
                      />
                    </Tooltip>

                    {/* Audio toggle */}
                    <Tooltip
                      title={
                        localParticipant.audioEnabled
                          ? "Mute microphone"
                          : "Unmute microphone"
                      }
                    >
                      <Button
                        shape="circle"
                        size="large"
                        onClick={toggleAudio}
                        className={`${
                          localParticipant.audioEnabled
                            ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                            : "bg-red-600 border-red-600 text-white hover:bg-red-700"
                        } w-12 h-12 flex items-center justify-center`}
                        icon={
                          localParticipant.audioEnabled ? (
                            <Mic size={20} />
                          ) : (
                            <MicOff size={20} />
                          )
                        }
                      />
                    </Tooltip>

                    {/* Screen share */}
                    <Tooltip title="Share screen">
                      <Button
                        shape="circle"
                        size="large"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                        icon={<Monitor size={20} />}
                      />
                    </Tooltip>

                    {/* Chat */}
                    <Tooltip title="Chat">
                      <Button
                        shape="circle"
                        size="large"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                        icon={<MessageSquare size={20} />}
                      />
                    </Tooltip>

                    {/* Participants */}
                    <Tooltip title="Participants">
                      <Button
                        shape="circle"
                        size="large"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                        icon={<Users size={20} />}
                      />
                    </Tooltip>

                    {/* Settings */}
                    <Tooltip title="Settings">
                      <Button
                        shape="circle"
                        size="large"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                        icon={<Settings size={20} />}
                      />
                    </Tooltip>

                    {/* More options */}
                    <Tooltip title="More options">
                      <Button
                        shape="circle"
                        size="large"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                        icon={<MoreHorizontal size={20} />}
                      />
                    </Tooltip>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-600 mx-2" />

                    {/* End call */}
                    <Tooltip title="Leave call">
                      <Button
                        shape="circle"
                        size="large"
                        onClick={handleLeaveCall}
                        className="bg-red-600 border-red-600 text-white hover:bg-red-700 w-12 h-12 flex items-center justify-center"
                        icon={<PhoneOff size={20} />}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Demo controls */}
              <div className="flex justify-center mt-4 gap-2">
                <Button
                  size="small"
                  onClick={addParticipant}
                  className="bg-green-600 border-green-600 text-white hover:bg-green-700"
                >
                  Add Participant
                </Button>
                <Button
                  size="small"
                  onClick={removeParticipant}
                  disabled={participants.length === 0}
                  className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                  icon={<UserX size={14} />}
                >
                  Remove
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingRoom;
