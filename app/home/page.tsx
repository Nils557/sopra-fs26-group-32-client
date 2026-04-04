"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import { useWebSocket } from '../hooks/useWebSocket';

export function LobbyPage() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleWebSocketMessage = useCallback((data: { content: string }) => {
    setMessages((prev) => [...prev, data.content]);
  }, []);
  
  // Listen to a specific lobby topic
  const { sendMessage } = useWebSocket('/topic/lobby/1', handleWebSocketMessage);

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

  const handleJoin = () => {
    setErrorMsg(null);
    if (!lobbyCode.trim()) {
      setErrorMsg("Please enter a lobby code.");
      return;
    }

    try {
      // Attempt to navigate to the lobby
      router.push(`/lobbies/${lobbyCode.trim()}`);
    } catch (error: unknown) {
      // Error handling logic
      let status: number | null = null;
      if (error instanceof Error) {
        const match = error.message.match(/\((\d{3}):/);
        if (match) status = parseInt(match[1], 10);
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