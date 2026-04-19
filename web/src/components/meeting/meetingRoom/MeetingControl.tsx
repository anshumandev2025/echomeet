import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Drawer, Tooltip } from "antd";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  MessageSquare,
  CirclePlay,
  CircleStop,
} from "lucide-react";
import ChatComponent from "./chat/Chat";
import ParticipantsList from "./participant/ParticipantList";
import type { Participant } from "../../../types/MediaTypes";
import useChatState from "../../../store/chatState";
import { socket } from "../../../socket/SocketConnect";

interface MeetingControlsProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeaveCall: () => void;
  participants: Participant[];
  isRecording: boolean;
  onToggleRecording: () => void;
  isHost: boolean;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
}
const MeetingControls: React.FC<MeetingControlsProps> = ({
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onLeaveCall,
  participants,
  isRecording,
  onToggleRecording,
  isHost,
}) => {
  const [openChat, setOpenChat] = useState(false);
  const [openParticipants, setOpenParticipants] = useState(false);
  const { unreadMessageCount, setUnreadMessageCount, setMessages } =
    useChatState();
  const unreadMessageCountRef = useRef(unreadMessageCount);
  useEffect(() => {
    socket.on("receive-new-message", ({ userName, newMessage, timeStamp }) => {
      const newMsg = {
        id: Date.now(),
        user: userName,
        message: newMessage,
        timestamp: timeStamp,
        isMe: false,
      };
      setMessages(newMsg);
      if (openChat) {
        setUnreadMessageCount(0);
        unreadMessageCountRef.current = 0;
      } else {
        unreadMessageCountRef.current++;
        setUnreadMessageCount(unreadMessageCountRef.current);
      }
    });
    return () => {
      socket.off("receive-new-message");
    };
  }, []);
  return (
    <div className="flex justify-center w-full pb-6">
      <div className="flex items-center gap-3 px-6 py-3 bg-[#303134] rounded-full shadow-lg border border-[#3c4043]">
        {/* Audio toggle */}
        <Tooltip
          title={audioEnabled ? "Turn off microphone" : "Turn on microphone"}
        >
          <Button
            shape="circle"
            size="large"
            onClick={onToggleAudio}
            className={`${
              audioEnabled
                ? "bg-[#3c4043] border-transparent text-white hover:bg-[#474a4d]"
                : "bg-red-500 border-red-500 text-white hover:bg-red-600"
            } w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200`}
            icon={audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          />
        </Tooltip>

        {/* Video toggle */}
        <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
          <Button
            shape="circle"
            size="large"
            onClick={onToggleVideo}
            className={`${
              videoEnabled
                ? "bg-[#3c4043] border-transparent text-white hover:bg-[#474a4d]"
                : "bg-red-500 border-red-500 text-white hover:bg-red-600"
            } w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200`}
            icon={videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          />
        </Tooltip>

        {isHost && (
          <Tooltip title={isRecording ? "Stop Recording" : "Start Recoding"}>
            <Button
              onClick={onToggleRecording}
              shape="circle"
              size="large"
              className={`${
                isRecording
                  ? "bg-red-50 text-red-500 border-red-200"
                  : "bg-[#3c4043] border-transparent text-white hover:bg-[#474a4d]"
              } w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200`}
              icon={
                isRecording ? (
                  <CircleStop size={20} fill="currentColor" />
                ) : (
                  <CirclePlay size={20} />
                )
              }
            />
          </Tooltip>
        )}

        {/* Chat */}
        <Tooltip title="Chat">
          <Badge
            count={openChat ? 0 : unreadMessageCountRef.current}
            showZero={false}
            size="small"
            offset={[-5, 5]}
          >
            <Button
              onClick={() => {
                setOpenChat(true);
                setUnreadMessageCount(0);
                unreadMessageCountRef.current = 0;
              }}
              shape="circle"
              size="large"
              className="bg-[#3c4043] border-transparent text-white hover:bg-[#474a4d] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200"
              icon={<MessageSquare size={20} />}
            />
          </Badge>
        </Tooltip>

        {/* Participants */}
        <Tooltip title="Participants">
          <Button
            onClick={() => setOpenParticipants(true)}
            shape="circle"
            size="large"
            className="bg-[#3c4043] border-transparent text-white hover:bg-[#474a4d] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200"
            icon={<Users size={20} />}
          />
        </Tooltip>

        {/* End call */}
        <Tooltip title="Leave call">
          <Button
            shape="circle"
            size="large"
            onClick={onLeaveCall}
            className="bg-red-600 border-transparent text-white hover:bg-red-700 w-12 h-8 md:w-16 md:h-12 rounded-full flex items-center justify-center ml-2"
            icon={<PhoneOff size={20} />}
          />
        </Tooltip>
      </div>

      <Drawer
        title={<span className="text-white">In-call messages</span>}
        closable={true}
        closeIcon={<span className="text-white">✕</span>}
        onClose={() => setOpenChat(false)}
        open={openChat}
        className="meeting-drawer"
        styles={{
          header: {
            background: "#202124",
            borderBottom: "1px solid #3c4043",
            color: "white",
          },
          body: { background: "#202124", padding: 0 },
          mask: { background: "transparent" },
        }}
        width={320}
      >
        <ChatComponent />
      </Drawer>

      <Drawer
        title={<span className="text-white">Participants</span>}
        closable={true}
        closeIcon={<span className="text-white">✕</span>}
        onClose={() => setOpenParticipants(false)}
        open={openParticipants}
        className="meeting-drawer"
        styles={{
          header: {
            background: "#202124",
            borderBottom: "1px solid #3c4043",
            color: "white",
          },
          body: { background: "#202124", padding: 0 },
          mask: { background: "transparent" },
        }}
        width={320}
      >
        <ParticipantsList participants={participants} />
      </Drawer>
    </div>
  );
};

export default MeetingControls;
