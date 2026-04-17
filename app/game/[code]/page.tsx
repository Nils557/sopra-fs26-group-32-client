"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import styles from "@/styles/page.module.css";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useWebSocket } from "@/hooks/useWebSocket";
import LocationImage from "@/components/LocationImage";

interface RoundData {
  imageUrl: string;
  roundNumber: number;
  totalRounds: number;
  timeLeft: number;
}

const GameRound: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lobbyCode = params.code as string;

  const { value: username } = useSessionStorage<string>("username", "");
  const { value: isHostStored } = useSessionStorage<string>("isHost", "false");
  const isHost = isHostStored === "true";

  const [round, setRound] = useState<RoundData | null>(null);
  const [hostLeft, setHostLeft] = useState(false);
  const [leaverNotice, setLeaverNotice] = useState<string | null>(null);
  const playersRef = useRef<string[]>([]);
  const hideLeaverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRoundUpdate = useCallback((data: RoundData) => {
    setRound(data);
  }, []);

  useWebSocket<RoundData>(`/topic/game/${lobbyCode}/image`, handleRoundUpdate);

  // Keep track of the live player list so we can surface mid-game leavers.
  // Backend broadcasts string[] on /topic/lobby/{code}/players after each removal.
  const handlePlayersUpdate = useCallback((data: unknown) => {
    if (!Array.isArray(data)) return;
    const next = data
      .map((p) => (typeof p === "string" ? p : (p as { username?: string }).username))
      .filter((n): n is string => typeof n === "string");
    const prev = playersRef.current;
    if (prev.length > 0) {
      const gone = prev.filter((n) => !next.includes(n) && n !== username);
      if (gone.length > 0) {
        setLeaverNotice(`${gone.join(", ")} left the game`);
        if (hideLeaverTimer.current) clearTimeout(hideLeaverTimer.current);
        hideLeaverTimer.current = setTimeout(() => setLeaverNotice(null), 4000);
      }
    }
    playersRef.current = next;
  }, [username]);

  useWebSocket<unknown>(`/topic/lobby/${lobbyCode}/players`, handlePlayersUpdate);

  const handleGameOver = useCallback(
    (msg: string) => {
      if (msg === "GAME_OVER") {
        router.push("/home");
      }
    },
    [router]
  );

  useWebSocket<string>(`/topic/game/${lobbyCode}/status`, handleGameOver);

  // Host disconnect during a round: backend broadcasts HOST_DISCONNECTED on the
  // lobby topic. Non-hosts are kicked to /home; the host (who is the one leaving)
  // handles their own navigation.
  const handleDisconnect = useCallback(() => {
    if (isHost) return;
    setHostLeft(true);
    setTimeout(() => router.push("/home"), 3000);
  }, [router, isHost]);

  useWebSocket<string>(`/topic/lobby/${lobbyCode}/disconnect`, handleDisconnect);

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      {round && (
        <div
          style={{
            position: "absolute",
            top: "30px",
            right: "40px",
            color: "#6b7280",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          Round {round.roundNumber} / {round.totalRounds}
        </div>
      )}

      {hostLeft && (
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#ff4d4f",
            fontSize: "15px",
            fontWeight: 700,
            background: "#151c2c",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "1px solid #1e2940",
          }}
        >
          The host has disconnected. Redirecting to home...
        </div>
      )}

      {leaverNotice && !hostLeft && (
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#f4941b",
            fontSize: "14px",
            fontWeight: 600,
            background: "#151c2c",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #1e2940",
          }}
        >
          {leaverNotice}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {round ? (
          <LocationImage imageUrl={round.imageUrl} />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "16/9",
              background: "#151c2c",
              borderRadius: "16px",
              border: "1px solid #1e2940",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Wait for the first round...
          </div>
        )}

        <div className={styles.scoringBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className={styles.playerAvatar}>
                {username.substring(0, 2).toUpperCase()}
              </div>
              <span className={styles.settingLabel}>{username}</span>
            </div>
            {round && (
              <span style={{ color: "#f4941b", fontWeight: 700, fontSize: "18px" }}>
                {round.timeLeft}s
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default GameRound;