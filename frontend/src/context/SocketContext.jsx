import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const newSocket = io("http://localhost:5000", {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            
            if (user?.role) {
                newSocket.emit("join", user.role);
            }
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
