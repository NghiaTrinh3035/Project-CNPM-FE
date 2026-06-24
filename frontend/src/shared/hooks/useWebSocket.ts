import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/constants/queryKeys";
import { useSession } from "@/shared/hooks/useSession";

export const useWebSocket = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Build WebSocket URL
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    // Usually WebSocket endpoint is at /ws at the root, not inside /api
    const socketUrl = baseUrl.replace(/\/api\/?$/, "") + "/ws";

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to STOMP WebSocket");
        setIsConnected(true);

        // Subscribe to the user's notification channel
        stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
          if (message.body) {
            console.log("Received new notification via WebSocket");
            // Invalidate react-query cache to trigger a refetch of notifications
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications(user.id) });
          }
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from STOMP WebSocket");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    stompClient.activate();

    // Cleanup function: disconnect when component unmounts or user changes
    return () => {
      stompClient.deactivate();
    };
  }, [user, queryClient]);

  return { isConnected };
};
