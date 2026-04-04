import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { getWsDomain } from '../utils/environment';

export const useWebSocket = (topic: string, onMessage: (msg: any) => void) => {
  const client = useRef<Client | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("id");
    const wsUrl = getWsDomain();

    if (!userId || userId === "undefined") return;

    const stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        userId: userId,
      },
      onConnect: () => {
        stompClient.subscribe(topic, (message) => {
          onMessage(JSON.parse(message.body));
        });
      },
      onStompError: () => {},
      onWebSocketClose: () => {}
    });

    stompClient.activate();
    client.current = stompClient;

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [topic]);

  return {
    sendMessage: (destination: string, body: any) => {
      if (client.current?.connected) {
        client.current.publish({
          destination,
          body: JSON.stringify(body),
        });
      }
    }
  };
};