import { useState, useEffect, useRef } from "react";
import { Button, Select, Card, message, Input } from "antd";
import { motion, AnimatePresence } from "motion/react";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import useCurrentMeetingState from "../../../store/meetingState";
import { getMediaDevices, getUserMediaStream } from "../../../utils/userMedia";
import type { MediaDevice } from "../../../types/MediaTypes";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { LOGO } from "../../../constants/layoutConstant";
import { useGlobalMessage } from "../../../context/MessageProvider";
import { socket } from "../../../socket/SocketConnect";
import useUserState from "../../../store/userState";

const { Option } = Select;

const LobbyRoom = () => {
  const { roomName, setLocalStream, updateMeetingState } =
    useCurrentMeetingState();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [name, setName] = useState<string>("");
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  //   const [isBackgroundBlurred, setIsBackgroundBlurred] =
  //     useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const { showMessage } = useGlobalMessage();
  const { setUserName } = useUserState();
  //   const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (selectedVideoDevice || selectedAudioDevice) {
      updateMediaStream();
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  //   useEffect(() => {
  //     if (videoRef.current && canvasRef.current && stream) {
  //       applyBackgroundBlur(
  //         isBackgroundBlurred ? hiddenVideoRef.current : videoRef.current,
  //         canvasRef.current,
  //         isBackgroundBlurred
  //       );
  //     }
  //   }, [isBackgroundBlurred, stream]);

  const initializeMedia = async () => {
    setIsLoading(true);
    const {
      videoDevices,
      audioDevices,
      error: devicesError,
    } = await getMediaDevices();

    if (devicesError) {
      message.error("Failed to get media devices");
      setIsLoading(false);
      return;
    }

    setVideoDevices(videoDevices);
    setAudioDevices(audioDevices);

    if (videoDevices.length > 0)
      setSelectedVideoDevice(videoDevices[0].deviceId);
    if (audioDevices.length > 0)
      setSelectedAudioDevice(audioDevices[0].deviceId);

    const { stream: mediaStream, error: streamError } =
      await getUserMediaStream({
        video:
          videoDevices.length > 0
            ? { deviceId: videoDevices[0].deviceId }
            : false,
        audio:
          audioDevices.length > 0
            ? { deviceId: audioDevices[0].deviceId }
            : false,
      });

    if (streamError || !mediaStream) {
      message.error("Failed to access camera and microphone");
      setIsLoading(false);
      return;
    }
    setLocalStream(mediaStream);
    setStream(mediaStream);
    if (videoRef.current) videoRef.current.srcObject = mediaStream;
    if (hiddenVideoRef.current) hiddenVideoRef.current.srcObject = mediaStream;
    setIsLoading(false);
  };

  const updateMediaStream = async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    const constraints: MediaStreamConstraints = {
      video:
        isCameraOn && selectedVideoDevice
          ? { deviceId: selectedVideoDevice }
          : false,
      audio:
        isMicOn && selectedAudioDevice
          ? { deviceId: selectedAudioDevice }
          : false,
    };

    const { stream: newStream, error } = await getUserMediaStream(constraints);
    if (error || !newStream) {
      message.error("Failed to update media stream");
      return;
    }
    setLocalStream(newStream);
    setStream(newStream);
    if (videoRef.current) videoRef.current.srcObject = newStream;
    if (hiddenVideoRef.current) hiddenVideoRef.current.srcObject = newStream;
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => {
      const newState = !prev;
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = newState;
      }
      return newState;
    });
  };

  const toggleMicrophone = () => {
    setIsMicOn((prev) => {
      const newState = !prev;
      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = newState;
      }
      return newState;
    });
  };

  const handleJoinMeeting = () => {
    // onJoinMeeting?.(stream);
    if (!name) {
      showMessage("error", "Please enter name");
      return;
    }
    setUserName(name);
    socket.emit("join-room", { roomId: roomName, userName: name });
    socket.emit("getRouterRtpCapabilities", (data: any) => {
      console.log(`getRouterRtpCapabilities: ${data.routerRtpCapabilities}`);
    });
    updateMeetingState("in-meeting");
  };

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex w-full justify-center">
            <LOGO textColor="white" />
          </div>
          <h1 className="text-3xl font-bold mt-12 text-white mb-2">
            Meeting Lobby
          </h1>
          <p className="text-gray-400">
            Room: <span className="text-green-400 font-mono">{roomName}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <AnimatePresence>
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p>Setting up your camera...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Main video display */}
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover`}
                      />

                      {/* Hidden video for blur processing */}
                      <video
                        ref={hiddenVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="hidden"
                      />

                      {/* Canvas for background blur */}
                      {/* <canvas
                        ref={canvasRef}
                        className={`w-full h-full object-cover ${isBackgroundBlurred ? "block" : "hidden"}`}
                      /> */}

                      {/* Camera off overlay */}
                      {!isCameraOn && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-gray-800 flex items-center justify-center"
                        >
                          <div className="text-center text-white">
                            <UserOutlined className="text-6xl mb-4 text-gray-400" />
                            <p className="text-lg">Camera is off</p>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>

                {/* Video controls overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3"
                >
                  <Button
                    shape="circle"
                    size="large"
                    onClick={toggleCamera}
                    className={`${
                      isCameraOn
                        ? "bg-green-600 border-green-600"
                        : "bg-red-600 border-red-600"
                    } text-white hover:opacity-80`}
                    icon={isCameraOn ? <Video /> : <VideoOff />}
                  />
                  <Button
                    shape="circle"
                    size="large"
                    onClick={toggleMicrophone}
                    className={`${
                      isMicOn
                        ? "bg-green-600 border-green-600"
                        : "bg-red-600 border-red-600"
                    } text-white hover:opacity-80`}
                    icon={isMicOn ? <Mic /> : <MicOff />}
                  />
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Device Settings */}
            <Card className="bg-white rounded-2xl shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SettingOutlined className="text-green-600" />
                  Device Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Camera
                    </label>
                    <Select
                      value={selectedVideoDevice}
                      onChange={setSelectedVideoDevice}
                      className="w-full"
                      size="large"
                      placeholder="Select camera"
                    >
                      {videoDevices.map((device) => (
                        <Option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Microphone
                    </label>
                    <Select
                      value={selectedAudioDevice}
                      onChange={setSelectedAudioDevice}
                      className="w-full"
                      size="large"
                      placeholder="Select microphone"
                    >
                      {audioDevices.map((device) => (
                        <Option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your name
                    </label>
                    <Input
                      type="text"
                      className="w-full"
                      size="large"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3"
                  >
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handleJoinMeeting}
                      disabled={isLoading}
                      className="h-12 text-lg font-semibold"
                      style={{
                        backgroundColor: "#10b981",
                        borderColor: "#10b981",
                        boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
                      }}
                    >
                      Join Meeting
                    </Button>
                  </motion.div>
                  {/* <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-gray-700">
                      Background Blur
                    </span>
                    <Switch
                      checked={isBackgroundBlurred}
                      onChange={setIsBackgroundBlurred}
                      style={{
                        backgroundColor: isBackgroundBlurred
                          ? "#10b981"
                          : undefined,
                      }}
                    />
                  </div> */}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LobbyRoom;
