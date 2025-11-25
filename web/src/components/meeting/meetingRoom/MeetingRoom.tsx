import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import useCurrentMeetingState from "../../../store/meetingState";
import MeetingControls from "./MeetingControl";
import MeetingHeader from "./MeetingHeader";
import VideoGrid from "./VideoGrid";
import { socket } from "../../../socket/SocketConnect";
import type {
  CreateTransportType,
  Participant,
  ProducersData,
} from "../../../types/MediaTypes";
import useMediaSoupState from "../../../store/mediaSoupState";
import type { Transport } from "mediasoup-client/types";
type MeetingRoomProps = {
  localParticipant: Participant;
  setLocalParticipant: React.Dispatch<React.SetStateAction<Participant>>;
};

const MeetingRoom = ({
  localParticipant,
  setLocalParticipant,
}: MeetingRoomProps) => {
  const { roomName, localStream } = useCurrentMeetingState();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { setRecvTransport, recvTransport, device } = useMediaSoupState();
  const { producerTransport } = useMediaSoupState();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isControlsHovered, setIsControlsHovered] = useState(false);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const { updateMeetingState } = useCurrentMeetingState();

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

  const toggleVideo = async () => {
    const isCurrentlyEnabled = localParticipant.videoEnabled;

    setLocalParticipant((prev) => ({
      ...prev,
      videoEnabled: !prev.videoEnabled,
    }));

    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];

      if (videoTrack && producerTransport) {
        if (isCurrentlyEnabled) {
          // TURN OFF VIDEO
          videoTrack.enabled = false;
          socket.emit("paused-producer-video", socket.id);
        } else {
          // TURN ON VIDEO
          videoTrack.enabled = true;
          socket.emit("resume-producer-video", socket.id);
        }
      }
    }
  };

  const toggleAudio = () => {
    const isCurrentlyEnabled = localParticipant.audioEnabled;

    setLocalParticipant((prev) => ({
      ...prev,
      audioEnabled: !prev.audioEnabled,
    }));

    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];

      if (audioTrack && producerTransport) {
        if (isCurrentlyEnabled) {
          // TURN OFF VIDEO
          audioTrack.enabled = false;
          socket.emit("paused-producer-audio", socket.id);
        } else {
          // TURN ON VIDEO
          audioTrack.enabled = true;
          socket.emit("resume-producer-audio", socket.id);
        }
      }
    }
  };

  const handleLeaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    socket.disconnect();
    updateMeetingState("join");
    window.location.reload();
  };
  useEffect(() => {
    const produceMedia = async () => {
      if (!localStream || !producerTransport) return;

      // 🔵 VIDEO
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        await producerTransport.produce({
          track: videoTrack,
          appData: { mediaType: "video" },
        });
        console.log("Video producer created");
      }

      // 🔊 AUDIO
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        await producerTransport.produce({
          track: audioTrack,
          appData: { mediaType: "audio" },
        });
        console.log("Audio producer created");
      }
    };

    produceMedia();
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
          // const newStream = new MediaStream([consumer.track]);
          //   if (kind == "audio") return;
          //   setParticipants((prev) => [
          //     ...prev,
          //     {
          //       id: Date.now().toString(),
          //       socketId: params.userInfo.socketId,
          //       name: params.userInfo.userName || "user",
          //       stream: newStream,
          //       videoEnabled: true,
          //       audioEnabled: true,
          //       isSpeaking: false,
          //     },
          //   ]);
          setParticipants((prev) => {
            let existing = prev.find((p) => p.socketId === socketId);

            if (!existing) {
              // Create new participant with empty stream
              existing = {
                id: Date.now().toString(),
                socketId,
                name: params.userInfo.userName || "user",
                stream: new MediaStream(), // initially empty
                videoEnabled: params.userInfo.videoEnabled,
                audioEnabled: params.userInfo.audioEnabled,
                isSpeaking: params.userInfo.isSpeaking,
              };
            }

            // Add track to same MediaStream
            if (existing.stream) existing.stream.addTrack(consumer.track);
            // Replace old participant OR add new one
            const updated = prev.filter((p) => p.socketId !== socketId);
            return [...updated, existing];
          });
        }
      );
    };
    if (recvTransport) {
      socket.on("new-producer", async ({ socketId, producerId }) => {
        consumeMedia(producerId, recvTransport, socketId);
      });
      socket.emit("get-all-producers", { socketId: socket.id }, (data: any) => {
        data.producers.forEach((producer: ProducersData) => {
          consumeMedia(producer.producerId, recvTransport, producer.socketId);
        });
      });
    }
    return () => {
      socket.off("new-producer");
      socket.off("get-all-producers");
    };
  }, [recvTransport]);

  useEffect(() => {
    socket.on("user-left", ({ userName, socketId }) => {
      console.log({ userName, socketId });
      setParticipants((prev) =>
        prev.filter((par) => par.socketId !== socketId)
      );
    });
    socket.on("user-resume-video", ({ socketId }) => {
      setParticipants((participant) =>
        participant.map((part) =>
          part.socketId == socketId ? { ...part, videoEnabled: true } : part
        )
      );
    });
    socket.on("user-paused-video", ({ socketId }) => {
      setParticipants((participant) =>
        participant.map((part) =>
          part.socketId == socketId ? { ...part, videoEnabled: false } : part
        )
      );
    });

    socket.on("user-resume-audio", ({ socketId }) => {
      setParticipants((participant) =>
        participant.map((part) =>
          part.socketId == socketId ? { ...part, audioEnabled: true } : part
        )
      );
    });

    socket.on("user-paused-audio", ({ socketId }) => {
      setParticipants((participant) =>
        participant.map((part) =>
          part.socketId == socketId ? { ...part, audioEnabled: false } : part
        )
      );
    });
    return () => {
      socket.off("user-left");
      socket.off("user-resume-video");
      socket.off("user-paused-video");
      socket.off("user-resume-audio");
      socket.off("user-pause-audio");
    };
  }, []);
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
              participants={[localParticipant, ...participants]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeetingRoom;
