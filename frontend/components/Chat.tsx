"use client";

import useSocket from "@/hooks/useSocket";
import { useState } from "react";

export default function Chat() {
  const socket = useSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  socket?.on("message", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket?.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-2">Chat</h2>
      <div className="border p-2 h-40 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        className="border p-2 w-full mt-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button className="bg-blue-500 text-white px-4 py-2 mt-2" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
