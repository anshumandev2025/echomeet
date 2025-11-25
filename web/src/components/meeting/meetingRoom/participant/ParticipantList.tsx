import { motion, AnimatePresence } from "motion/react";
import { Badge, Avatar, Tooltip } from "antd";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import type { Participant } from "../../../../types/MediaTypes";

const ParticipantsList = ({
  participants,
}: {
  participants: Participant[];
}) => {
  // const getParticipantMenuItems = (
  //   participant: Participant
  // ): MenuProps["items"] => [
  //   {
  //     key: "mute",
  //     label: participant.audioEnabled ? "Unmute" : "Mute",
  //     icon: participant.audioEnabled ? <Mic size={14} /> : <MicOff size={14} />,
  //   },
  //   {
  //     key: "video",
  //     label: participant.videoEnabled ? "Turn off camera" : "Turn on camera",
  //     icon: participant.videoEnabled ? (
  //       <VideoOff size={14} />
  //     ) : (
  //       <Video size={14} />
  //     ),
  //   },
  //   {
  //     type: "divider",
  //   },
  //   {
  //     key: "remove",
  //     label: "Remove from meeting",
  //     icon: <PhoneOff size={14} />,
  //     danger: true,
  //   },
  //   {
  //     key: "block",
  //     label: "Block participant",
  //     icon: <VolumeX size={14} />,
  //     danger: true,
  //   },
  // ];

  // const handleMenuClick = (key: string, participant: Participant) => {
  //   console.log(`Action: ${key} for participant: ${participant.name}`);
  //   // Handle participant actions here
  // };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (participant: Participant) => {
    // if (participant.isPresenting) return "#10b981"; // green
    if (!participant.audioEnabled) return "#f59e0b"; // amber
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
                      {/* {participant.isPresenting && (
                        <Tooltip title="Presenting">
                          <Shield size={14} className="text-green-600" />
                        </Tooltip>
                      )} */}
                    </div>
                    {/* <p className="text-xs text-gray-400">
                      Joined {participant.joinTime}
                    </p> */}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-2">
                  {/* Mic Status */}
                  <Tooltip
                    title={participant.audioEnabled ? "Muted" : "Unmuted"}
                  >
                    <div
                      className={`p-1 rounded ${
                        participant.audioEnabled
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {participant.audioEnabled ? (
                        <Mic size={14} />
                      ) : (
                        <MicOff size={14} />
                      )}
                    </div>
                  </Tooltip>

                  {/* Video Status */}
                  <Tooltip
                    title={
                      participant.videoEnabled ? "Camera on" : "Camera off"
                    }
                  >
                    <div
                      className={`p-1 rounded ${
                        participant.videoEnabled
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {participant.videoEnabled ? (
                        <Video size={14} />
                      ) : (
                        <VideoOff size={14} />
                      )}
                    </div>
                  </Tooltip>

                  {/* More Options */}
                  {/* <Dropdown
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
                  </Dropdown> */}
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
