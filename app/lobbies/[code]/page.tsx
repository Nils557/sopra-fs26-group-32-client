"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useParams } from "next/navigation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useApi } from "@/hooks/useApi";

interface LobbyInfo {
  maxPlayers: number;
  hostUsername: string;
}

const WaitingRoom: React.FC = () => {
  const router = useRouter();
  const { value: username } = useSessionStorage<string>("username", "");
  const params = useParams();
  const lobbyCode = params.code as string;
  const [hostLeft, setHostLeft] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo | null>(null);
  const apiService = useApi();

  useEffect(() => {
    const fetchLobbyData = async () => {
      try {
        const [playerList, lobby] = await Promise.all([
          apiService.get<string[]>(`/lobbies/${lobbyCode}/players`),
          apiService.get<LobbyInfo>(`/lobbies/${lobbyCode}`),
        ]);
        setPlayers(playerList);
        setLobbyInfo(lobby);
      } catch (error) {
        console.error("Failed to fetch lobby data:", error);
      }
    };
    fetchLobbyData();
  }, [lobbyCode, apiService]);

  const handleWsMessage = useCallback(
    (msg: string) => {
      if (msg === "HOST_DISCONNECTED") {
        setHostLeft(true);
        setTimeout(() => router.push("/home"), 3000);
      }
    },
    [router]
  );

  useWebSocket<string>("/topic/lobby/updates", handleWsMessage);

  const handlePlayersUpdate = useCallback((playerList: string[]) => {
    setPlayers(playerList);
  }, []);

  useWebSocket<string[]>(
    `/topic/lobby/${lobbyCode}/players`,
    handlePlayersUpdate
  );

  const maxPlayers = lobbyInfo?.maxPlayers ?? 0;
  const hostUsername = lobbyInfo?.hostUsername ?? "";

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <div className={styles.centerWrapper}>
        <div className={styles.loginCard}>
          <p
            className={styles.hugeSubtitle}
            style={{
              fontSize: "12px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Share this code with friends
          </p>

          <h1
            className={styles.hugeTitle}
            style={{ fontSize: "48px", letterSpacing: "6px" }}
          >
            {lobbyCode}
          </h1>

          {hostLeft && (
            <p
              style={{
                color: "#ff4d4f",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              The host has disconnected. Redirecting to home...
            </p>
          )}

          <div className={styles.scoringBox}>
            <p className={styles.scoringTitle}>
              Players ({players.length} / {maxPlayers})
            </p>

            {players.map((playerName, index) => (
              <div className={styles.settingRow} key={index}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className={styles.playerAvatar}>
                    {playerName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={styles.settingLabel}>{playerName}</span>
                </div>
                {playerName === hostUsername && (
                  <div className={styles.hostBadge}>HOST</div>
                )}
              </div>
            ))}
          </div>

          {players.length < 2 ? (
            <button className={`${styles.createButton} ${styles.disabledButton}`} disabled>
              Start Game
            </button>
          ) : (
            <button className={`${styles.createButton}`}>Start Game</button>
          )}
        </div>
      </div>
    </main>
  );
};

export default WaitingRoom;