import React from "react";
import { AnimatePresence } from "motion/react";
import ParticipantVideo from "./ParticipantVideo";

interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSpeaking: boolean;
}

interface VideoGridProps {
  participants: Participant[];
  localParticipant: Participant;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localParticipant,
}) => {
  const allParticipants = [localParticipant, ...participants];
  const participantCount = allParticipants.length;

  // Get grid configuration based on participant count (Google Meet style)
  const getGridConfig = (count: number) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (count === 1) {
      return { columns: 1, rows: 1, gap: "0px" };
    } else if (count === 2) {
      return isMobile
        ? { columns: 1, rows: 2, gap: "8px" }
        : { columns: 2, rows: 1, gap: "12px" };
    } else if (count <= 4) {
      return { columns: 2, rows: 2, gap: isMobile ? "8px" : "12px" };
    } else if (count <= 6) {
      return isMobile
        ? { columns: 2, rows: 3, gap: "8px" }
        : { columns: 3, rows: 2, gap: "12px" };
    } else if (count <= 9) {
      return { columns: 3, rows: 3, gap: isMobile ? "6px" : "10px" };
    } else if (count <= 12) {
      return isMobile
        ? { columns: 2, rows: Math.ceil(count / 2), gap: "6px" }
        : { columns: 4, rows: 3, gap: "10px" };
    } else if (count <= 16) {
      return { columns: 4, rows: 4, gap: isMobile ? "4px" : "8px" };
    } else if (count <= 20) {
      return isMobile
        ? { columns: 3, rows: Math.ceil(count / 3), gap: "4px" }
        : { columns: 5, rows: 4, gap: "6px" };
    } else if (count <= 25) {
      return isMobile
        ? { columns: 3, rows: Math.ceil(count / 3), gap: "4px" }
        : { columns: 5, rows: 5, gap: "6px" };
    } else {
      return isMobile
        ? { columns: 3, rows: Math.ceil(count / 3), gap: "3px" }
        : { columns: 6, rows: Math.ceil(count / 6), gap: "4px" };
    }
  };

  const { columns, gap } = getGridConfig(participantCount);

  // Calculate appropriate aspect ratio and max height based on count
  const getVideoConstraints = (count: number) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (count === 1) {
      return { aspectRatio: "16/9", maxHeight: "calc(100vh - 180px)" };
    } else if (count === 2) {
      return isMobile
        ? { aspectRatio: "16/9", maxHeight: "calc((100vh - 200px) / 2 - 8px)" }
        : { aspectRatio: "16/9", maxHeight: "calc(100vh - 180px)" };
    } else if (count <= 4) {
      return isMobile
        ? { aspectRatio: "16/9", maxHeight: "calc((100vh - 220px) / 2 - 8px)" }
        : {
            aspectRatio: "16/9",
            maxHeight: "calc((100vh - 200px) / 2 - 12px)",
          };
    } else if (count <= 6) {
      return isMobile
        ? { aspectRatio: "4/3", maxHeight: "calc((100vh - 240px) / 3 - 8px)" }
        : {
            aspectRatio: "16/9",
            maxHeight: "calc((100vh - 200px) / 2 - 12px)",
          };
    } else if (count <= 9) {
      return isMobile
        ? { aspectRatio: "4/3", maxHeight: "calc((100vh - 260px) / 3 - 8px)" }
        : { aspectRatio: "4/3", maxHeight: "calc((100vh - 220px) / 3 - 10px)" };
    } else if (count <= 12) {
      return isMobile
        ? { aspectRatio: "4/3", maxHeight: "200px" }
        : { aspectRatio: "4/3", maxHeight: "calc((100vh - 220px) / 3 - 10px)" };
    } else if (count <= 16) {
      return isMobile
        ? { aspectRatio: "4/3", maxHeight: "180px" }
        : { aspectRatio: "4/3", maxHeight: "calc((100vh - 240px) / 4 - 8px)" };
    } else {
      return isMobile
        ? { aspectRatio: "4/3", maxHeight: "160px" }
        : { aspectRatio: "4/3", maxHeight: "160px" };
    }
  };

  const { aspectRatio, maxHeight } = getVideoConstraints(participantCount);
  const needsScroll = participantCount > 16;

  return (
    <div className="h-full w-full overflow-hidden">
      <div
        className={`h-full w-full ${
          needsScroll
            ? "overflow-y-auto overflow-x-hidden"
            : "flex items-center justify-center"
        } p-2 sm:p-4`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#4B5563 #1F2937",
        }}
      >
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap,
            maxWidth: participantCount === 1 ? "1200px" : "100%",
            margin: needsScroll ? "0" : "auto",
            height: needsScroll ? "auto" : "fit-content",
          }}
        >
          <AnimatePresence mode="popLayout">
            {allParticipants.map((participant) => (
              <div
                key={participant.id}
                style={{
                  aspectRatio: aspectRatio,
                  maxHeight: maxHeight,
                  width: "100%",
                }}
              >
                <ParticipantVideo
                  participant={participant}
                  isLocal={participant.id === "local"}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VideoGrid;
