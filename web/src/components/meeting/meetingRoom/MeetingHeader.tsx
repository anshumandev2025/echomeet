import React from "react";
import { motion } from "motion/react";
import { Users } from "lucide-react";

interface MeetingHeaderProps {
  roomName: string;
  participantCount: number;
  isVisible: boolean;
}

const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  roomName,
  participantCount,
  isVisible,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -20,
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
          <span>{participantCount} participants</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MeetingHeader;
