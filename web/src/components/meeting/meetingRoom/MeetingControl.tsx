import React, { useState } from "react";
import { Button, Drawer, Tooltip } from "antd";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  MessageSquare,
  Monitor,
  UserX,
} from "lucide-react";
import ChatComponent from "./chat/Chat";
import ParticipantsList from "./participant/ParticipantList";

interface MeetingControlsProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onLeaveCall: () => void;
  onAddParticipant?: () => void;
  onRemoveParticipant?: () => void;
  canRemoveParticipant?: boolean;
  showDemoControls?: boolean;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onLeaveCall,
  onAddParticipant,
  onRemoveParticipant,
  canRemoveParticipant = false,
  showDemoControls = false,
}) => {
  const [openChat, setOpenChat] = useState(false);
  const [openParticipants, setOpenParticipants] = useState(false);
  return (
    <div className="bg-gradient-to-t from-black/70 to-transparent md:p-6">
      <div className="flex items-center justify-center">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl border border-gray-700">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Video toggle */}
            <Tooltip
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              <Button
                shape="circle"
                size="large"
                onClick={onToggleVideo}
                className={`${
                  videoEnabled
                    ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    : "bg-red-600 border-red-600 text-white hover:bg-red-700"
                } w-12 h-12 flex items-center justify-center`}
                icon={
                  videoEnabled ? <Video size={20} /> : <VideoOff size={20} />
                }
              />
            </Tooltip>

            {/* Audio toggle */}
            <Tooltip
              title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              <Button
                shape="circle"
                size="large"
                onClick={onToggleAudio}
                className={`${
                  audioEnabled
                    ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    : "bg-red-600 border-red-600 text-white hover:bg-red-700"
                } w-12 h-12 flex items-center justify-center`}
                icon={audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              />
            </Tooltip>

            {/* Screen share */}
            <Tooltip title="Share screen">
              <Button
                shape="circle"
                size="large"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                icon={<Monitor size={20} />}
              />
            </Tooltip>

            {/* Chat */}
            <Tooltip title="Chat">
              <Button
                onClick={() => setOpenChat(true)}
                shape="circle"
                size="large"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                icon={<MessageSquare size={20} />}
              />
            </Tooltip>

            {/* Participants */}
            <Tooltip title="Participants">
              <Button
                onClick={() => setOpenParticipants(true)}
                shape="circle"
                size="large"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                icon={<Users size={20} />}
              />
            </Tooltip>

            {/* Settings */}
            {/* <Tooltip title="Settings">
              <Button
                shape="circle"
                size="large"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                icon={<Settings size={20} />}
              />
            </Tooltip> */}

            {/* More options */}
            {/* <Tooltip title="More options">
              <Button
                shape="circle"
                size="large"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 w-12 h-12 flex items-center justify-center"
                icon={<MoreHorizontal size={20} />}
              />
            </Tooltip> */}

            {/* Divider */}
            <div className="h-8 w-px bg-gray-600 mx-2" />

            {/* End call */}
            <Tooltip title="Leave call">
              <Button
                shape="circle"
                size="large"
                onClick={onLeaveCall}
                className="bg-red-600 border-red-600 text-white hover:bg-red-700 w-12 h-12 flex items-center justify-center"
                icon={<PhoneOff size={20} />}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Demo controls */}
      {showDemoControls && (
        <div className="flex justify-center mt-4 gap-2">
          <Button
            size="small"
            onClick={onAddParticipant}
            className="bg-green-600 border-green-600 text-white hover:bg-green-700"
          >
            Add Participant
          </Button>
          <Button
            size="small"
            onClick={onRemoveParticipant}
            disabled={!canRemoveParticipant}
            className="bg-red-600 border-red-600 text-white hover:bg-red-700"
            icon={<UserX size={14} />}
          >
            Remove
          </Button>
        </div>
      )}
      <Drawer
        title="Chat"
        closable={{ "aria-label": "Close Button" }}
        onClose={() => setOpenChat(false)}
        open={openChat}
        className=""
      >
        <ChatComponent />
      </Drawer>

      <Drawer
        title="Participants"
        onClose={() => setOpenParticipants(false)}
        open={openParticipants}
      >
        <ParticipantsList />
      </Drawer>
    </div>
  );
};

export default MeetingControls;
