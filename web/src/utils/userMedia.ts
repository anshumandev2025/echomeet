import type { MediaDevice } from "../types/MediaTypes";

export const getUserMediaStream = async (
  constraints: MediaStreamConstraints = { video: true, audio: true }
): Promise<{ stream: MediaStream | null; error: string | null }> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { stream, error: null };
  } catch (error: any) {
    console.error("Error accessing media devices:", error);
    return { stream: null, error: error.message };
  }
};

export const getMediaDevices = async (): Promise<{
  videoDevices: MediaDevice[];
  audioDevices: MediaDevice[];
  error: string | null;
}> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const audioDevices = devices.filter(
      (device) => device.kind === "audioinput"
    );

    return {
      videoDevices: videoDevices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
      })),
      audioDevices: audioDevices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Microphone ${index + 1}`,
      })),
      error: null,
    };
  } catch (error: any) {
    console.error("Error getting media devices:", error);
    return { videoDevices: [], audioDevices: [], error: error.message };
  }
};

export const applyBackgroundBlur = (
  videoElement: HTMLVideoElement | null,
  canvasElement: HTMLCanvasElement | null,
  isBlurred: boolean
): void => {
  if (!videoElement || !canvasElement) return;

  const canvas = canvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const processFrame = () => {
    if (videoElement.videoWidth && videoElement.videoHeight) {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      ctx.filter = isBlurred ? "blur(8px)" : "none";
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      if (isBlurred) {
        ctx.filter = "none";
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(processFrame);
  };

  processFrame();
};
