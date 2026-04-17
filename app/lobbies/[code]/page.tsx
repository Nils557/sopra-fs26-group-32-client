"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/styles/page.module.css";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useApi } from "@/hooks/useApi";

// Backend returns the lobby object — only fields we actually use
interface Lobby {
  maxPlayers: number;
  totalRounds?: number;
  status?: string;
}

// Payload pushed on /topic/lobby/{code}/start
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

  // Backend returns string[] (list of usernames)
  const [players, setPlayers] = useState<string[]>([]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [hostLeft, setHostLeft] = useState(false);
  const [starting, setStarting] = useState(false);
  const apiService = useApi();

  // Fetch initial state on mount. Retry on transient failures — cold-start of the
  // App Engine backend occasionally surfaces as a 401 on the first request.
  useEffect(() => {
    if (!lobbyCode) return;
    let cancelled = false;

    const fetchWithRetry = async <T,>(
      path: string,
      attempts = 4,
    ): Promise<T | null> => {
      for (let i = 0; i < attempts; i++) {
        if (cancelled) return null;
        try {
          return await apiService.get<T>(path);
        } catch (err) {
          if (i === attempts - 1) throw err;
          await new Promise((r) => setTimeout(r, 400 * (i + 1)));
        }
      }
      return null;
    };

    const fetchData = async () => {
      try {
        const [playerList, lobbyData] = await Promise.all([
          fetchWithRetry<string[]>(`/lobbies/${lobbyCode}/players`),
          fetchWithRetry<Lobby>(`/lobbies/${lobbyCode}`),
        ]);
        if (cancelled) return;
        if (playerList) setPlayers(playerList);
        if (lobbyData) setLobby(lobbyData);
      } catch (err) {
        console.error("Failed to load lobby data:", err);
      }
    };
    fetchData();

    return () => {
      cancelled = true;
    };
  }, [lobbyCode, apiService]);

  // S4: Real-time player list updates
  // Backend REST returns string[], but WebSocket may push Player[] objects — normalise both
  const handlePlayersUpdate = useCallback((data: unknown) => {
    if (!Array.isArray(data)) return;
    if (data.length === 0) { setPlayers([]); return; }
    if (typeof data[0] === "string") {
      setPlayers(data as string[]);
    } else if (typeof data[0] === "object" && data[0] !== null && "username" in data[0]) {
      setPlayers((data as { username: string }[]).map((p) => p.username));
    }
  }, []);
  useWebSocket<unknown>(`/topic/lobby/${lobbyCode}/players`, handlePlayersUpdate);

  // S5: All players (including non-host) are redirected when game starts
  const handleGameStart = useCallback(
    (_data: LobbyStart) => {
      router.push(`/game/${lobbyCode}`);
    },
    [router, lobbyCode]
  );
  useWebSocket<LobbyStart>(`/topic/lobby/${lobbyCode}/start`, handleGameStart);

  // S3: Host disconnected via WebSocket event
  const handleDisconnect = useCallback(
    (_reason: string) => {
      setHostLeft(true);
      setTimeout(() => router.push("/home"), 3000);
    },
    [router]
  );
  useWebSocket<string>(`/topic/lobby/${lobbyCode}/disconnect`, handleDisconnect);

  // Polling fallback — every 4s refresh the player list for everyone, and
  // detect host departure for non-hosts (catches missed WebSocket messages on GCP).
  useEffect(() => {
    if (!lobbyCode) return;
    let cancelled = false;

    const poll = setInterval(async () => {
      if (cancelled) return;
      try {
        const current = await apiService.get<string[]>(`/lobbies/${lobbyCode}/players`);
        const normalised = current.map((p) =>
          typeof p === "string" ? p : (p as { username: string }).username
        );
        setPlayers(normalised);
        if (!isHost && hostUsername && !normalised.includes(hostUsername)) {
          cancelled = true;
          setHostLeft(true);
          setTimeout(() => router.push("/home"), 3000);
        }
      } catch (err) {
        // Only redirect on an actual 404 (lobby was deleted). Transient 401s/500s
        // from cold starts or DB hiccups must NOT surface as "host disconnected"
        // to the other players.
        const status = (err as { status?: number })?.status;
        if (status === 404 && !isHost) {
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

  // S5: Only host calls this — triggers the /start WebSocket event for everyone else
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
              Players ({players.length} / {lobby?.maxPlayers ?? "…"})
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
