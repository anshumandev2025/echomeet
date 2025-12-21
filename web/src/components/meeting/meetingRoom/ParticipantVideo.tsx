import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MicOff, VideoOff } from "lucide-react";

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
  }, [participant.stream, participant.videoEnabled]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative bg-gray-900 rounded-lg overflow-hidden shadow-lg w-full h-full ${className}`}
    >
      {/* Border indicator for local user and speaking */}
      <div
        className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-200 z-10 ${
          participant.isSpeaking
            ? "ring-4 ring-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
            : isLocal
            ? "ring-2 ring-green-500"
            : "ring-2 ring-gray-700"
        }`}
      />

      {participant.videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
          <div className="text-center text-white">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
              <span className="text-lg sm:text-2xl md:text-3xl font-bold">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base font-medium px-2 truncate max-w-[150px] sm:max-w-[200px] mx-auto">
              {participant.name}
            </p>
          </div>
        </div>
      )}

      {/* Bottom overlay with name and status */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/50 to-transparent p-1.5 sm:p-2 md:p-3 z-20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-1 min-w-0">
            <span className="text-white text-[10px] sm:text-xs md:text-sm font-medium truncate">
              {isLocal ? "You" : participant.name}
            </span>
            {isLocal && (
              <span className="text-[8px] sm:text-[10px] md:text-xs bg-green-600 text-white px-1 sm:px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                LOCAL
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {!participant.audioEnabled && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                <MicOff
                  size={12}
                  className="text-white sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                />
              </div>
            )}
            {!participant.videoEnabled && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                <VideoOff
                  size={12}
                  className="text-white sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParticipantVideo;
