import { create } from "zustand";

interface MessageInterface {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  isMe: boolean;
}
interface ChatStateInterface {
  messages: MessageInterface[];
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;
  setMessages: (message: MessageInterface) => void;
}
const useChatState = create<ChatStateInterface>((set) => ({
  messages: [],
  unreadMessageCount: 0,
  setUnreadMessageCount: (count) => set(() => ({ unreadMessageCount: count })),
  setMessages: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

export default useChatState;
