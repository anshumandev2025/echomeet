import { useState, useEffect, useRef } from "react";
import { message } from "antd";
import { motion, AnimatePresence } from "motion/react";
import useCurrentMeetingState from "../../../store/meetingState";
import MeetingControls from "./MeetingControl";
import MeetingHeader from "./MeetingHeader";
import VideoGrid from "./VideoGrid";
import { socket } from "../../../socket/SocketConnect";
import type {
  CreateTransportType,
  Participant,
} from "../../../types/MediaTypes";
import useMediaSoupState from "../../../store/mediaSoupState";
import type { Transport } from "mediasoup-client/types";

const MeetingRoom = () => {
  const { roomName, localStream, setLocalStream } = useCurrentMeetingState();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { setRecvTransport, recvTransport, device } = useMediaSoupState();
  const [localParticipant, setLocalParticipant] = useState<Participant>({
    id: "local",
    name: "You",
    stream: localStream,
    videoEnabled: true,
    audioEnabled: true,
    isSpeaking: false,
  });
  const { producerTransport } = useMediaSoupState();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isControlsHovered, setIsControlsHovered] = useState(false);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const { updateMeetingState } = useCurrentMeetingState();
  // Initialize demo participants
  // useEffect(() => {
  //   const demoParticipants: Participant[] = [
  //     {
  //       id: "2",
  //       name: "Alice Johnson",
  //       stream: null,
  //       videoEnabled: true,
  //       audioEnabled: true,
  //       isSpeaking: false,
  //     },
  //     {
  //       id: "3",
  //       name: "Bob Smith",
  //       stream: null,
  //       videoEnabled: false,
  //       audioEnabled: true,
  //       isSpeaking: false,
  //     },
  //     {
  //       id: "4",
  //       name: "Carol Wilson",
  //       stream: null,
  //       videoEnabled: true,
  //       audioEnabled: false,
  //       isSpeaking: true,
  //     },
  //   ];

  //   demoParticipants.forEach((participant, index) => {
  //     setTimeout(() => {
  //       setParticipants((prev) => [...prev, participant]);
  //     }, (index + 1) * 1000);
  //   });
  // }, []);

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
  useEffect(() => {
    const produceMedia = async () => {
      if (!localStream || !producerTransport) return;
      const track = localStream.getVideoTracks()[0];
      await producerTransport.produce({ track });
    };
    if (localStream && producerTransport) {
      produceMedia();
    }
  }, [localStream, producerTransport]);
  useEffect(() => {
    const createRecvTransport = async () => {
      if (!device) return;
      socket.emit(
        "create-transport",
        { roomId: roomName, direction: "recv" },
        async (params: CreateTransportType) => {
          const transport = device.createRecvTransport(params);
          transport.on("connect", ({ dtlsParameters }, callback) => {
            socket.emit(
              "connect-transport",
              { transportId: transport.id, dtlsParameters },
              callback
            );
          });
          // await transport.connect();
          setRecvTransport(transport);
        }
      );
    };
    createRecvTransport();
  }, []);
  useEffect(() => {
    const consumeMedia = async (
      producerId: string,
      recvTransport: Transport,
      socketId: string
    ) => {
      if (!recvTransport || !device) return;
      socket.emit(
        "consume",
        {
          producerId: producerId,
          rtpCapabilities: device.rtpCapabilities,
          socketId,
        },
        async (params: any) => {
          if (params.error) {
            console.error("Cannot consume", params.error);
            return;
          }
          const consumer = await recvTransport.consume({
            id: params.producerInfo.id,
            producerId: params.producerInfo.producerId,
            kind: params.producerInfo.kind,
            rtpParameters: params.producerInfo.rtpParameters,
          });
          const newStream = new MediaStream([consumer.track]);
          setParticipants((prev) => [
            ...prev,
            {
              id: params.userInfo.socketId,
              name: params.userInfo.userName || "user",
              stream: newStream,
              videoEnabled: true,
              audioEnabled: true,
              isSpeaking: false,
            },
          ]);
        }
      );
    };
    if (recvTransport) {
      socket.on("new-producer", async ({ socketId, producerId, kind }) => {
        console.log("socket.id-->", socketId, kind);
        consumeMedia(producerId, recvTransport, socketId);
      });
    }
  }, [recvTransport]);
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
