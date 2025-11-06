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
  // console.log("participant--->", participants);
  // Helper function to get grid configuration based on screen size and participant count
  const getGridConfig = (count: number) => {
    // Check if we're on mobile (you can also use a proper hook for this)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (count === 1) {
      return { columns: 1, rows: 1, isScrollable: false };
    } else if (count === 2) {
      // On mobile: stack vertically, on desktop: side by side
      return isMobile
        ? { columns: 1, rows: 2, isScrollable: false }
        : { columns: 2, rows: 1, isScrollable: false };
    } else if (count === 3) {
      // On mobile: 2 columns with scrolling, on desktop: 3 columns
      return isMobile
        ? { columns: 2, rows: Math.ceil(count / 2), isScrollable: true }
        : { columns: 3, rows: 1, isScrollable: false };
    } else {
      // 4+ participants: always 2 columns per row, scrollable
      return { columns: 2, rows: Math.ceil(count / 2), isScrollable: true };
    }
  };

  const { columns, rows, isScrollable } = getGridConfig(participantCount);

  return (
    <div className="h-full w-full p-2 sm:p-4 flex flex-col">
      {isScrollable ? (
        // Scrollable layout for 3+ participants on mobile or 4+ on desktop
        <div className="flex-1 overflow-y-auto">
          <div
            className="grid gap-2 sm:gap-4 min-h-full"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridAutoRows: "minmax(200px, 1fr)",
            }}
          >
            <AnimatePresence mode="popLayout">
              {allParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="min-h-[200px] sm:min-h-[300px] flex justify-center items-center"
                >
                  <ParticipantVideo
                    participant={participant}
                    isLocal={participant.id === "local"}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Non-scrollable layout
        <div
          className="grid gap-2 sm:gap-4 flex-1 h-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          <AnimatePresence mode="popLayout">
            {allParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex justify-center items-center min-h-0"
              >
                <ParticipantVideo
                  participant={participant}
                  isLocal={participant.id === "local"}
                  className="w-full h-full max-w-full max-h-full"
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
