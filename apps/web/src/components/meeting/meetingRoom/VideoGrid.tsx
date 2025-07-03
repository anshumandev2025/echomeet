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

  // Helper function to get grid configuration
  const getGridConfig = (count: number) => {
    if (count === 1) {
      return { columns: 1, rows: 1, isScrollable: false };
    } else if (count === 2) {
      return { columns: 2, rows: 1, isScrollable: false };
    } else if (count === 3) {
      return { columns: 3, rows: 1, isScrollable: false };
    } else {
      // 4+ participants: 2 columns per row, scrollable
      return { columns: 2, rows: Math.ceil(count / 2), isScrollable: true };
    }
  };

  const { columns, rows, isScrollable } = getGridConfig(participantCount);

  return (
    <div className="h-full w-full p-4 flex flex-col">
      {isScrollable ? (
        // Scrollable layout for 4+ participants
        <div className="flex-1 overflow-y-auto">
          <div
            className="grid gap-4 min-h-full"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridAutoRows: "minmax(300px, 1fr)",
            }}
          >
            <AnimatePresence mode="popLayout">
              {allParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="min-h-[300px] flex justify-center items-center"
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
        // Non-scrollable layout for 1-3 participants
        <div
          className="grid gap-4 flex-1 h-full"
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
