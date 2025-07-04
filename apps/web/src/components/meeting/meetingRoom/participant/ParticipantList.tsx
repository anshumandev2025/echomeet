import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button, Badge, Avatar, Tooltip, Dropdown, type MenuProps } from "antd";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  Shield,
  PhoneOff,
  VolumeX,
} from "lucide-react";
import { MoreOutlined } from "@ant-design/icons";

interface Participant {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isPresenting: boolean;
  joinTime: string;
  status: "active" | "inactive";
}

const ParticipantsList: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      avatar: null,
      isHost: true,
      isMuted: false,
      isVideoOn: true,
      isPresenting: false,
      joinTime: "10:00 AM",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      avatar: null,
      isHost: false,
      isMuted: true,
      isVideoOn: true,
      isPresenting: false,
      joinTime: "10:02 AM",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      avatar: null,
      isHost: false,
      isMuted: false,
      isVideoOn: false,
      isPresenting: false,
      joinTime: "10:05 AM",
      status: "active",
    },
    {
      id: 4,
      name: "Emily Chen",
      email: "emily.chen@company.com",
      avatar: null,
      isHost: false,
      isMuted: true,
      isVideoOn: true,
      isPresenting: true,
      joinTime: "10:08 AM",
      status: "active",
    },
    {
      id: 5,
      name: "David Smith",
      email: "david.smith@company.com",
      avatar: null,
      isHost: false,
      isMuted: true,
      isVideoOn: false,
      isPresenting: false,
      joinTime: "10:12 AM",
      status: "active",
    },
    {
      id: 6,
      name: "Lisa Brown",
      email: "lisa.brown@company.com",
      avatar: null,
      isHost: false,
      isMuted: false,
      isVideoOn: true,
      isPresenting: false,
      joinTime: "10:15 AM",
      status: "active",
    },
  ]);

  const getParticipantMenuItems = (
    participant: Participant
  ): MenuProps["items"] => [
    {
      key: "mute",
      label: participant.isMuted ? "Unmute" : "Mute",
      icon: participant.isMuted ? <Mic size={14} /> : <MicOff size={14} />,
      disabled: participant.isHost,
    },
    {
      key: "video",
      label: participant.isVideoOn ? "Turn off camera" : "Turn on camera",
      icon: participant.isVideoOn ? (
        <VideoOff size={14} />
      ) : (
        <Video size={14} />
      ),
      disabled: participant.isHost,
    },
    {
      type: "divider",
    },
    {
      key: "remove",
      label: "Remove from meeting",
      icon: <PhoneOff size={14} />,
      danger: true,
      disabled: participant.isHost,
    },
    {
      key: "block",
      label: "Block participant",
      icon: <VolumeX size={14} />,
      danger: true,
      disabled: participant.isHost,
    },
  ];

  const handleMenuClick = (key: string, participant: Participant) => {
    console.log(`Action: ${key} for participant: ${participant.name}`);
    // Handle participant actions here
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (participant: Participant) => {
    if (participant.isPresenting) return "#10b981"; // green
    if (!participant.isMuted) return "#f59e0b"; // amber
    return "#6b7280"; // gray
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Avatar with Status */}
                  <div className="relative">
                    <Badge
                      dot
                      color={getStatusColor(participant)}
                      offset={[-2, 32]}
                    >
                      <Avatar
                        size={40}
                        src={participant.avatar || undefined}
                        className="bg-green-600 text-white font-semibold"
                      >
                        {getInitials(participant.name)}
                      </Avatar>
                    </Badge>
                  </div>

                  {/* Participant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate">
                        {participant.name}
                      </span>
                      {participant.isHost && (
                        <Tooltip title="Host">
                          <Crown size={14} className="text-yellow-500" />
                        </Tooltip>
                      )}
                      {participant.isPresenting && (
                        <Tooltip title="Presenting">
                          <Shield size={14} className="text-green-600" />
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {participant.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined {participant.joinTime}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-2">
                  {/* Mic Status */}
                  <Tooltip title={participant.isMuted ? "Muted" : "Unmuted"}>
                    <div
                      className={`p-1 rounded ${
                        participant.isMuted
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {participant.isMuted ? (
                        <MicOff size={14} />
                      ) : (
                        <Mic size={14} />
                      )}
                    </div>
                  </Tooltip>

                  {/* Video Status */}
                  <Tooltip
                    title={participant.isVideoOn ? "Camera on" : "Camera off"}
                  >
                    <div
                      className={`p-1 rounded ${
                        participant.isVideoOn
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {participant.isVideoOn ? (
                        <Video size={14} />
                      ) : (
                        <VideoOff size={14} />
                      )}
                    </div>
                  </Tooltip>

                  {/* More Options */}
                  <Dropdown
                    menu={{
                      items: getParticipantMenuItems(participant),
                      onClick: ({ key }) =>
                        handleMenuClick(key as string, participant),
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      size="small"
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    />
                  </Dropdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ParticipantsList;
