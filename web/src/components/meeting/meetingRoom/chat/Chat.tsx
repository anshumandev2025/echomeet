import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send } from "lucide-react";
import { Button, Input } from "antd";
import { socket } from "../../../../socket/SocketConnect";
import useUserState from "../../../../store/userState";
import { useSearchParams } from "react-router-dom";
import useChatState from "../../../../store/chatState";
const ChatComponent = () => {
  const { messages, setMessages } = useChatState();

  const { userName } = useUserState();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    //@ts-ignore
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: Date.now(),
        user: "You",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: true,
      };
      setMessages(newMsg);
      socket.emit("send-new-message", {
        roomId,
        userName,
        newMessage,
        timeStamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setNewMessage("");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full w-full flex flex-col bg-white"
    >
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.isMe
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                } shadow-sm`}
              >
                {!msg.isMe && (
                  <div className="text-xs font-semibold text-green-700 mb-1">
                    {msg.user}
                  </div>
                )}
                <div className="text-sm leading-relaxed">{msg.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.isMe ? "text-green-100" : "text-gray-500"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="Send a message to everyone"
            className="flex-1 border-gray-300 focus:border-green-500 hover:border-green-400"
            size="middle"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              type="primary"
              icon={<Send size={18} />}
              className={`${
                newMessage.trim()
                  ? "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                  : "bg-gray-300 border-gray-300"
              } h-8 w-8 p-0`}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatComponent;
