"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

// ========================== INTERFACES ==========================

interface ChatParamsContextType {
  // Paramètres de chat
  selectedEmployee: string | null;
  setSelectedEmployee: (employeeId: string | null) => void;

  // État de chargement
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Messages
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;

  // Configuration
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
}

interface ChatMessage {
  id: string;
  content: string;
  author: "user" | "agent";
  timestamp: Date;
  isError?: boolean;
}

// ========================== CONTEXT ==========================

const ChatParamsContext = createContext<ChatParamsContextType | undefined>(
  undefined
);

// ========================== PROVIDER ==========================

export function ChatParamsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // ✅ Handlers stabilisés avec useCallback
  const stableSetSelectedEmployee = useCallback((employeeId: string | null) => {
    setSelectedEmployee(employeeId);
  }, []);

  const stableSetIsLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const stableSetMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const stableSetIsTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  // ✅ Valeur stabilisée avec useMemo
  const contextValue = useMemo(
    () => ({
      selectedEmployee,
      setSelectedEmployee: stableSetSelectedEmployee,
      isLoading,
      setIsLoading: stableSetIsLoading,
      messages,
      setMessages: stableSetMessages,
      addMessage,
      isTyping,
      setIsTyping: stableSetIsTyping,
    }),
    [
      selectedEmployee,
      stableSetSelectedEmployee,
      isLoading,
      stableSetIsLoading,
      messages,
      stableSetMessages,
      addMessage,
      isTyping,
      stableSetIsTyping,
    ]
  );

  return (
    <ChatParamsContext.Provider value={contextValue}>
      {children}
    </ChatParamsContext.Provider>
  );
}

// ========================== HOOK ==========================

export function useChatParams(): ChatParamsContextType {
  const context = useContext(ChatParamsContext);
  if (!context) {
    throw new Error("useChatParams must be used within a ChatParamsProvider");
  }
  return context;
}
