import React, { createContext, useContext, useMemo } from "react";
import { message } from "antd";

type MessageType = "success" | "error" | "info" | "warning" | "loading";

interface MessageContextType {
  showMessage: (type: MessageType, content: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = useMemo(
    () => (type: MessageType, content: string) => {
      messageApi.open({ type, content });
    },
    [messageApi]
  );

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export const useGlobalMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useGlobalMessage must be used within a MessageProvider");
  }
  return context;
};
