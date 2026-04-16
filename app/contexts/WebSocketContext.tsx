"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getWsDomain } from "@/utils/environment";

type MsgCallback = (msg: unknown) => void;

interface WSContextValue {
  subscribe: (topic: string, subId: string, cb: MsgCallback) => void;
  unsubscribe: (topic: string, subId: string) => void;
  disconnect: () => void;
}

const WSContext = createContext<WSContextValue | null>(null);

interface TopicState {
  stompSub: StompSubscription | null;
  listeners: Map<string, MsgCallback>;
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const clientRef = useRef<Client | null>(null);
  const topicsRef = useRef<Map<string, TopicState>>(new Map());

  const attachStompSub = useCallback((client: Client, topic: string) => {
    const state = topicsRef.current.get(topic);
    if (!state || state.stompSub) return;
    state.stompSub = client.subscribe(topic, (msg: IMessage) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(msg.body);
      } catch {
        parsed = msg.body;
      }
      // Call all listeners for this topic
      state.listeners.forEach((cb) => cb(parsed));
    });
  }, []);

  const initClient = useCallback(() => {
    if (clientRef.current) return;

    const userId =
      sessionStorage.getItem("userId")?.replace(/"/g, "") ?? "";
    if (!userId || userId === "undefined") return;

    const client = new Client({
      webSocketFactory: () => new SockJS(getWsDomain()),
      connectHeaders: { userId },
      reconnectDelay: 5000,
      onConnect: () => {
        // Re-attach STOMP subscriptions for all pending topics
        topicsRef.current.forEach((_, topic) => {
          attachStompSub(client, topic);
        });
      },
      onDisconnect: () => {
        // Clear stompSub refs so they get re-created on next reconnect
        topicsRef.current.forEach((state) => {
          state.stompSub = null;
        });
      },
    });

    client.activate();
    clientRef.current = client;
  }, [attachStompSub]);

  useEffect(() => {
    return () => {
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, []);

  const subscribe = useCallback(
    (topic: string, subId: string, cb: MsgCallback) => {
      initClient();

      if (!topicsRef.current.has(topic)) {
        topicsRef.current.set(topic, { stompSub: null, listeners: new Map() });
      }
      const state = topicsRef.current.get(topic)!;
      state.listeners.set(subId, cb);

      // If already connected, subscribe to STOMP immediately
      if (clientRef.current?.connected) {
        attachStompSub(clientRef.current, topic);
      }
    },
    [initClient, attachStompSub]
  );

  const unsubscribe = useCallback((topic: string, subId: string) => {
    const state = topicsRef.current.get(topic);
    if (!state) return;
    state.listeners.delete(subId);
    // Only STOMP-unsubscribe when the last listener on this topic is gone
    if (state.listeners.size === 0) {
      state.stompSub?.unsubscribe();
      topicsRef.current.delete(topic);
    }
  }, []);

  // Call on logout so a fresh connection is made on next login
  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
    clientRef.current = null;
    topicsRef.current.clear();
  }, []);

  return (
    <WSContext.Provider value={{ subscribe, unsubscribe, disconnect }}>
      {children}
    </WSContext.Provider>
  );
}

export function useWSContext() {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("Must be rendered inside <WebSocketProvider>");
  return ctx;
}
