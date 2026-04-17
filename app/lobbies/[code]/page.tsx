"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/styles/page.module.css";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useApi } from "@/hooks/useApi";

interface Lobby {
  maxPlayers: number;
  totalRounds?: number;
  status?: string;
}

interface LobbyStart {
  lobbyCode: string;
  status: string;
  currentRound: unknown;
}

const WaitingRoom: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lobbyCode = params.code as string;

  const { value: userId } = useSessionStorage<string>("userId", "");
  const { value: isHostStored } = useSessionStorage<string>("isHost", "false");
  const { value: hostUsername } = useSessionStorage<string>("hostUsername", "");
  const isHost = isHostStored === "true";

  const [players, setPlayers] = useState<string[]>([]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [hostLeft, setHostLeft] = useState(false);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const apiService = useApi();

  useEffect(() => {
    if (!lobbyCode) return;
    const fetchData = async () => {
      try {
        const [playerList, lobbyData] = await Promise.all([
          apiService.get<string[]>(`/lobbies/${lobbyCode}/players`),
          apiService.get<Lobby>(`/lobbies/${lobbyCode}`),
        ]);
        setPlayers(playerList);
        setLobby(lobbyData);
      } catch (err) {
        console.error("Failed to load lobby data:", err);
      }
    };
    fetchData();
  }, [lobbyCode, apiService]);

  const handlePlayersUpdate = useCallback((data: unknown) => {
    if (Array.isArray(data)) setPlayers(data as string[]);
  }, []);
  useWebSocket<unknown>(`/topic/lobby/${lobbyCode}/players`, handlePlayersUpdate);

  const handleGameStart = useCallback(
    (_data: LobbyStart) => {
      router.push(`/game/${lobbyCode}`);
    },
    [router, lobbyCode]
  );
  useWebSocket<LobbyStart>(`/topic/lobby/${lobbyCode}/start`, handleGameStart);

  const handleDisconnect = useCallback(
    (_reason: string) => {
      setHostLeft(true);
      setTimeout(() => router.push("/home"), 3000);
    },
    [router]
  );
  useWebSocket<string>(`/topic/lobby/${lobbyCode}/disconnect`, handleDisconnect);

  // Polling fallback — every 4s refresh the player list. Also detects host departure
  // for non-hosts when WebSocket messages are missed.
  useEffect(() => {
    if (!lobbyCode) return;
    let cancelled = false;

    const poll = setInterval(async () => {
      if (cancelled) return;
      try {
        const current = await apiService.get<string[]>(`/lobbies/${lobbyCode}/players`);
        setPlayers(current);
        if (!isHost && hostUsername && !current.includes(hostUsername)) {
          cancelled = true;
          setHostLeft(true);
          setTimeout(() => router.push("/home"), 3000);
        }
      } catch {
        if (!isHost) {
          cancelled = true;
          setHostLeft(true);
          setTimeout(() => router.push("/home"), 3000);
        }
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [lobbyCode, isHost, hostUsername, apiService, router]);

  const handleStartGame = async () => {
    if (!isHost || players.length < 2 || starting) return;
    setStarting(true);
    try {
      await apiService.post(`/lobbies/${lobbyCode}/start`, {
        hostUserId: Number(userId),
      });
      router.push(`/game/${lobbyCode}`);
    } catch (err) {
      console.error("Failed to start game:", err);
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await apiService.delete(`/lobbies/${lobbyCode}/players/${userId}`);
    } catch (err) {
      console.error("Failed to leave lobby:", err);
    } finally {
      sessionStorage.removeItem("isHost");
      sessionStorage.removeItem("hostUsername");
      sessionStorage.removeItem("maxPlayers");
      router.push("/home");
    }
  };

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <button
        className={styles.backButton}
        onClick={handleLeave}
        disabled={leaving}
      >
        {leaving ? "Leaving..." : "← Leave lobby"}
      </button>

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
            <p style={{ color: "#ff4d4f", textAlign: "center", marginBottom: "12px" }}>
              The host has disconnected. Redirecting to home...
            </p>
          )}

          <div className={styles.scoringBox}>
            <p className={styles.scoringTitle}>
              Players ({players.length} / {lobby?.maxPlayers ?? "?"})
            </p>

            {players.map((playerName) => (
              <div className={styles.settingRow} key={playerName}>
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

          {isHost ? (
            <button
              className={`${styles.createButton} ${
                players.length < 2 || starting ? styles.disabledButton : ""
              }`}
              disabled={players.length < 2 || starting}
              onClick={handleStartGame}
            >
              {starting ? "Starting..." : "Start Game"}
            </button>
          ) : (
            <p
              style={{
                color: "#6b7280",
                textAlign: "center",
                fontSize: "14px",
                marginTop: "8px",
              }}
            >
              Waiting for host to start the game...
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default WaitingRoom;
