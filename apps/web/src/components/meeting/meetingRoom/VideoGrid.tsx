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
  maxVisibleParticipants?: number;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localParticipant,
  maxVisibleParticipants = 3,
}) => {
  const allParticipants = [localParticipant, ...participants];
  const shouldUseScroll = allParticipants.length > maxVisibleParticipants;

  return (
    <div className="h-full w-full p-4 overflow-y-auto flex flex-col">
      {shouldUseScroll ? (
        <div className="flex-1 overflow-y-auto pr-2">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              gridAutoRows: "minmax(250px, auto)",
            }}
          >
            <AnimatePresence mode="popLayout">
              {allParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="min-w-[300px] min-h-[200px] flex justify-center items-center"
                >
                  <ParticipantVideo
                    participant={participant}
                    isLocal={participant.id === "local"}
                    fixedSize={true}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div
          className="grid gap-4 flex-1"
          style={{
            gridTemplateColumns: `repeat(3, 1fr)`,
            gridTemplateRows: `repeat(${Math.ceil(
              allParticipants.length / 3
            )}, 1fr)`,
          }}
        >
          <AnimatePresence mode="popLayout">
            {allParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex justify-center items-center"
              >
                <ParticipantVideo
                  participant={participant}
                  isLocal={participant.id === "local"}
                  fixedSize={false}
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
