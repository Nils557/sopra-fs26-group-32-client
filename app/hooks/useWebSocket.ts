import { useEffect, useRef } from "react";
import { useWSContext } from "@/contexts/WebSocketContext";

/**
 * Subscribes to a STOMP topic using the shared singleton connection.
 * One STOMP connection is reused for the entire app — no per-call reconnects.
 *
 * The callback is kept in a ref so updating it between renders
 * does not trigger a re-subscription (no reconnect storms).
 */
export function useWebSocket<T>(
  topic: string,
  onMessage: (msg: T) => void
) {
  const { subscribe, unsubscribe } = useWSContext();

  // Stable ID per hook instance — does not change between renders
  const subId = useRef(Math.random().toString(36).slice(2)).current;

  // Always-current callback — avoids stale closures without re-subscribing
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    subscribe(topic, subId, (msg) => cbRef.current(msg as T));
    return () => unsubscribe(topic, subId);
    // topic and subId are stable; subscribe/unsubscribe are useCallback-stable
  }, [topic, subId, subscribe, unsubscribe]);
}
