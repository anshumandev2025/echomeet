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

  // Dynamic Grid Configuration
  const getGridStyles = (count: number) => {
    let cols = 1;
    let rows = 1;

    if (count === 1) {
      cols = 1;
      rows = 1;
    } else if (count === 2) {
      cols = 2;
      rows = 1;
    } // Side by side usually better for 2
    else if (count <= 4) {
      cols = 2;
      rows = 2;
    } else if (count <= 6) {
      cols = 3;
      rows = 2;
    } else if (count <= 9) {
      cols = 3;
      rows = 3;
    } else if (count <= 12) {
      cols = 4;
      rows = 3;
    } else if (count <= 16) {
      cols = 4;
      rows = 4;
    } else {
      cols = 5;
      rows = 4;
    } // Up to 20

    // Mobile adjustments
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (count <= 2) {
        cols = 1;
        rows = count;
      } else if (count <= 6) {
        cols = 2;
        rows = Math.ceil(count / 2);
      } else {
        cols = 3;
        rows = Math.ceil(count / 3);
      }
    }

    return { cols, rows };
  };

  const { cols, rows } = getGridStyles(participantCount);

  return (
    <div className="h-full w-full overflow-hidden flex items-center justify-center p-2 sm:p-4">
      <div
        // Changed: h-auto max-h-full to let content dictate height (up to full screen)
        // content-center ensures it stays vertically centered
        className="grid w-full h-auto max-h-full content-center justify-center"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          // Rows auto-size
          gap: "8px",
          maxWidth:
            participantCount === 1
              ? "1200px"
              : participantCount === 2
                ? "1600px"
                : "100%",
          width: "100%",
        }}
      >
        <AnimatePresence mode="popLayout">
          {allParticipants.map((participant) => (
            <div
              key={participant.id}
              // Force aspect ratio so the TILE is 16:9, not a vertical pillar.
              // Shadow and border radius moved here usually or inside ParticipantVideo.
              className="w-full min-h-0 min-w-0 aspect-video shadow-lg rounded-xl overflow-hidden"
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
  );
};

export default VideoGrid;
