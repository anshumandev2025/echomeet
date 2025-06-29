import { useState, useEffect } from "react";
import { Input, Button } from "antd";
import { LOGO } from "../../constants/layoutConstant";
import { generateRoomName } from "../../utils/helperFunctions";

const JoinMeeting = () => {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate initial room name on component mount
    setRoomName(generateRoomName());
  }, []);

  const handleJoinMeeting = async () => {
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      // Add your join meeting logic here
      console.log("Joining room:", roomName);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error joining meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewRoom = () => {
    setRoomName(generateRoomName());
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="p-6 bg-white rounded-2xl shadow-2xl">
            <LOGO />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Join Meeting
            </h1>
            <p className="text-gray-600">
              Enter the room name to join the meeting
            </p>
          </div>

          {/* Room Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Name
            </label>
            <div className="flex gap-2">
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                size="large"
                className="flex-1"
                style={{
                  borderColor: "#10b981",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#059669";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(16, 185, 129, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#10b981";
                  e.target.style.boxShadow = "none";
                }}
              />
              <Button
                onClick={handleGenerateNewRoom}
                size="large"
                className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400"
              >
                🎲
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Room names are 8 characters long (e.g., xa2rx0kl)
            </p>
          </div>

          {/* Join Button */}
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleJoinMeeting}
            disabled={!roomName.trim()}
            className="h-12 text-lg font-semibold"
            style={{
              backgroundColor: "#10b981",
              borderColor: "#10b981",
              boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
            }}
            onMouseEnter={(e) => {
              if (!loading && roomName.trim()) {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = "#059669";
                target.style.borderColor = "#059669";
                target.style.transform = "translateY(-1px)";
                target.style.boxShadow = "0 6px 20px 0 rgba(16, 185, 129, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                const target = e.target as HTMLInputElement;
                target.style.backgroundColor = "#10b981";
                target.style.borderColor = "#10b981";
                target.style.transform = "translateY(0)";
                target.style.boxShadow =
                  "0 4px 14px 0 rgba(16, 185, 129, 0.39)";
              }
            }}
          >
            {loading ? "Joining..." : "Join Meeting"}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">Secure • Encrypted • Fast</p>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;
