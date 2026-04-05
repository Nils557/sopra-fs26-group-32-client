"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import { useWebSocket } from '../hooks/useWebSocket';
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

/**
 * LobbyPage is now a private component (no 'export').
 * Next.js 'page.tsx' files only allow 'export default' and specific metadata exports.
 */
function LobbyPage() {
  const [messages, setMessages] = useState<string[]>([]);

  // Wrap the callback in useCallback to prevent the WebSocket from 
  // reconnecting every time the component renders.
  const handleWebSocketMessage = useCallback((data: { content: string }) => {
    setMessages((prev) => [...prev, data.content]);
  }, []);
  
  // Listen to a specific lobby topic
  // We pass the expected data type { content: string } to the generic hook
  const { sendMessage } = useWebSocket<{ content: string }>('/topic/lobby/1', handleWebSocketMessage);

  const handleAction = () => {
    sendMessage('/app/lobby/1/join', { userId: '123' });
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
      <h1 style={{ fontSize: '18px' }}>Live Lobby Connection</h1>
      <button onClick={handleAction} className={styles.joinButton} style={{ padding: '5px 10px' }}>
        Test Join Signal
      </button>
      <ul style={{ marginTop: '10px' }}>
        {messages.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  );
}

const Home: React.FC = () => {
  const router = useRouter();
  const [lobbyCode, setLobbyCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("userId", "");

  const handleJoin = async () => {
    setErrorMsg(null);
    if (!lobbyCode.trim()) {
      setErrorMsg("Please enter a lobby code.");
      return;
    }

    try {
      await apiService.post(`/lobbies/${lobbyCode.trim()}/players`, {
        userId: Number(userId),
      });
      router.push(`/lobbies/${lobbyCode.trim()}`);
    } catch (error: unknown) {
      // Error handling logic for navigation/server status
      let status: number | null = null;
      if (error instanceof Error) {
        const match = error.message.match(/\((\d{3}):/);
        status = match ? parseInt(match[1], 10) : null;
      }

      if (status === 404) setErrorMsg("Lobby not found.");
      else if (status === 409) setErrorMsg("Lobby is full.");
      else if (status === 403) setErrorMsg("Game has already started.");
      else if (status !== null) setErrorMsg(`Server error: ${status}`);
      else setErrorMsg("Could not connect to server.");
    }
  };

  return (
    <main className={styles.fullPageContainer}>
      {/* Keeping LobbyPage inside Home ensures the WebSocket starts on the landing page */}
      <LobbyPage />

      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <div className={styles.centerWrapper}>
        <div className={styles.heroText}>
          <h1 className={styles.hugeTitle}>Welcome back.</h1>
          <p className={styles.hugeSubtitle}>Create a lobby or join with a code.</p>
        </div>

        <div className={styles.loginCard}>
          <button
            className={styles.createButton}
            onClick={() => router.push("/lobbies/create")}
          >
            + Create Lobby
          </button>

          <div className={styles.divider}>
            <span>or join with a code</span>
          </div>

          <div className={styles.joinRow}>
            <input
              className={styles.largeInput}
              placeholder="Enter lobby code..."
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value)}
            />
            <button className={styles.joinButton} onClick={handleJoin}>
              Join
            </button>
          </div>

          {errorMsg && (
            <p style={{ color: "#ff4d4f", fontSize: "14px", marginTop: "8px", textAlign: "left" }}>
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;