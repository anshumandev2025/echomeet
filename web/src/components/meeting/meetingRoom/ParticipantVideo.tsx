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
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg sm:text-xl font-bold">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium px-2">
              {participant.name}
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-white text-xs sm:text-sm font-medium bg-black bg-opacity-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            {isLocal ? "You" : participant.name}
          </span>
          {isLocal && (
            <span className="text-xs bg-green-600 text-white px-1 sm:px-1.5 py-0.5 rounded">
              LOCAL
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!participant.audioEnabled && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center">
              <MicOff size={10} className="text-white sm:w-3 sm:h-3" />
            </div>
          )}
          {!participant.videoEnabled && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center">
              <VideoOff size={10} className="text-white sm:w-3 sm:h-3" />
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

export default ParticipantVideo;
