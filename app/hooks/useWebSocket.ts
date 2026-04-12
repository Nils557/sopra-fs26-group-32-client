
import { useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs'; // Added IMessage for better typing
import { getWsDomain } from '../utils/environment';

export const useWebSocket = <T,>(topic: string, onMessage: (msg: T) => void, onConnect?: () => void) => {
  const client = useRef<Client | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId"); //isch Id gsi statt userId
    const wsUrl = getWsDomain();

    if (!userId || userId === "undefined") return;

    const stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        userId: userId,
      },
      onConnect: () => {
        stompClient.subscribe(topic, (message: IMessage) => {
          onMessage(JSON.parse(message.body) as T);
        });
        if (onConnect) onConnect();
      },
    });

    stompClient.activate();
    client.current = stompClient;

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [topic, onMessage, onConnect]); 

  return {
    sendMessage: (destination: string, body: unknown) => {
      if (client.current?.connected) {
        client.current.publish({
          destination,
          body: JSON.stringify(body),
        });
      }
    }
  };
};