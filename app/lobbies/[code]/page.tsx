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
  hostUsername?: string;
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
  const isHost = isHostStored === "true";

  const [players, setPlayers] = useState<string[]>([]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [hostLeft, setHostLeft] = useState(false);
  const [starting, setStarting] = useState(false);
  const apiService = useApi();

  useEffect(() => {
    if (!lobbyCode) return;
    let cancelled = false;

    const fetchPlayers = async (attempt: number) => {
      try {
        const playerList = await apiService.get<string[]>(`/lobbies/${lobbyCode}/players`);
        if (cancelled) return;
        setPlayers(playerList);
      } catch (err) {
        if (cancelled) return;
        console.warn(`Initial players fetch attempt ${attempt} failed:`, err);
        if (attempt < 3) {
          setTimeout(() => fetchPlayers(attempt + 1), 500 * attempt);
        }
      }
    };

    const fetchLobby = async (attempt: number) => {
      try {
        const lobbyData = await apiService.get<Lobby>(`/lobbies/${lobbyCode}`);
        if (cancelled) return;
        setLobby(lobbyData);
      } catch (err) {
        if (cancelled) return;
        console.warn(`Initial lobby fetch attempt ${attempt} failed:`, err);
        if (attempt < 3) {
          setTimeout(() => fetchLobby(attempt + 1), 500 * attempt);
        }
      }
    };

    fetchPlayers(1);
    fetchLobby(1);

    return () => {
      cancelled = true;
    };
  }, [lobbyCode, apiService]);

  const handlePlayersUpdate = useCallback((data: unknown) => {
    if (Array.isArray(data)) setPlayers(data as string[]);
  }, []);
  useWebSocket<unknown>(`/topic/lobby/${lobbyCode}/players`, handlePlayersUpdate);

  const handleGameStart = useCallback(
    (_: LobbyStart) => {
      router.push(`/game/${lobbyCode}`);
    },
    [router, lobbyCode]
  );
  useWebSocket<LobbyStart>(`/topic/lobby/${lobbyCode}/start`, handleGameStart);

  const handleDisconnect = useCallback(
    (_: string) => {
      if (isHost) return;
      setHostLeft(true);
      setTimeout(() => router.push("/home"), 3000);
    },
    [router, isHost]
  );
  useWebSocket<string>(`/topic/lobby/${lobbyCode}/disconnect`, handleDisconnect);

  // Polling fallback — every 4s refresh the player list in case a WS broadcast
  // was missed. Host-departure detection is handled exclusively by the WS
  // /disconnect topic; a single failed fetch is not enough to declare the host gone.
  // Also backfills lobby metadata if the initial fetch didn't land.
  useEffect(() => {
    if (!lobbyCode) return;
    let cancelled = false;

    const poll = setInterval(async () => {
      if (cancelled) return;
      try {
        const current = await apiService.get<string[]>(`/lobbies/${lobbyCode}/players`);
        if (!cancelled) setPlayers(current);
      } catch (err) {
        console.warn("Polling roster refresh failed:", err);
      }
      if (cancelled) return;
      try {
        const data = await apiService.get<Lobby>(`/lobbies/${lobbyCode}`);
        if (cancelled) return;
        setLobby(data);
        // Safety net: if we missed the /start WS broadcast, the lobby's
        // INGAME status will catch us up here within ~4s.
        if (data.status === "INGAME") {
          clearInterval(poll);
          router.push(`/game/${lobbyCode}`);
        }
      } catch {
        // still no luck — next poll tick will retry
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [lobbyCode, apiService, router]);

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
                {lobby?.hostUsername && playerName === lobby.hostUsername && (
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
