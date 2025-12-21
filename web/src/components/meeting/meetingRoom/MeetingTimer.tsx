import React, { useEffect, useState } from "react";
import { Card } from "antd";

interface MeetingTimerProps {
  /**
   * Unix timestamp in milliseconds
   * Example: 1735725600000
   */
  meetingStartTimestamp: number;
}

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};

const MeetingTimer: React.FC<MeetingTimerProps> = ({
  meetingStartTimestamp,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!meetingStartTimestamp) return;

    const update = () => {
      const now = Date.now();
      const diff = Math.floor((now - meetingStartTimestamp) / 1000);
      setElapsedSeconds(Math.max(diff, 0));
    };

    update(); // initial
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [meetingStartTimestamp]);

  return (
    <Card className="w-fit  rounded-xl shadow-md">
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-1">Meeting Time</p>
        <p className="text-xl font-mono font-semibold text-green-600">
          {formatTime(elapsedSeconds)}
        </p>
      </div>
    </Card>
  );
};

export default MeetingTimer;
