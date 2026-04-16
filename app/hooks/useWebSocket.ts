import { useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWsDomain } from '../utils/environment';

export const useWebSocket = <T,>(topic: string, onMessage: (msg: T) => void) => {
  const client = useRef<Client | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId')?.replace(/"/g, '');
    const wsUrl = getWsDomain();
    if (!userId || userId === 'undefined') return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        userId: userId,
      },
      reconnectDelay: 2000,
      onConnect: () => {
        stompClient.subscribe(topic, (message: IMessage) => {
          try {
            onMessage(JSON.parse(message.body) as T);
          } catch {
            onMessage(message.body as unknown as T);
          }
        });
      },
    });

    stompClient.activate();
    client.current = stompClient;

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [topic, onMessage]);

  return {
    sendMessage: (destination: string, body: unknown) => {
      if (client.current?.connected) {
        client.current.publish({
          destination,
          body: JSON.stringify(body),
        });
      }
    },
  };
};
