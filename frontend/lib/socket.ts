import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (access_token: string) => {
    if (!socket) {
        socket = io("http://127.0.0.1:5000", {
            query: { access_token },  // Send token as query param
            transports: ["websocket"], // Ensure WebSocket connection
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });

        socket.on("authenticated", (data) => {
            console.log("Authenticated:", data.message);
        });

        socket.on("unauthorized", (data) => {
            console.error("Authentication Failed:", data.message);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });
    }
    return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
