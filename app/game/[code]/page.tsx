"use client";

import { useCallback, useState, useEffect, useRef} from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import styles from "@/styles/page.module.css";
import useSessionStorage from "@/hooks/useSessionStorage";
import { useWebSocket } from "@/hooks/useWebSocket";
import LocationImage from "@/components/LocationImage";
import dynamic from "next/dynamic";
import { ApiService } from "@/api/apiService";
const GameMap = dynamic(() => import("@/components/GameMap"), { ssr: false });

interface RoundData {
  roundId: number;
  imageUrl: string;
  roundNumber: number;
  totalRounds: number;
  timeLeft: number;
  correctCity?: string;
}
interface Answer {
  id: number;
  latitude: number;
  longitude: number;
  scoreResult: "CORRECT_CITY" | "CORRECT_COUNTRY" | "INCORRECT";
  pointsAwarded: number;
  submittedAt: string;
}

interface Player {
  id: number;
  username: string;
  totalScore: number;
  connected: boolean;
}

interface RoundSummaryData {
  correctCity: string;
  correctLatitude: number;
  correctLongitude: number;
  standings: { username: string; totalScore: number }[];
}
interface SubmissionUpdateDTO {
  playerId: number;
}
  const apiService = new ApiService();

  const GameRound: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const lobbyCode = params.code as string;

  const { value: username } = useSessionStorage<string>("username", "");
  const { value: userId } = useSessionStorage<string>("userId", "");
  const { value: isHostStored } = useSessionStorage<string>("isHost", "false");
  const isHost = isHostStored === "true";

  const [round, setRound] = useState<RoundData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [roundEnded, setRoundEnded] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSubmitted = useRef(false);
  const initializedRoundRef = useRef<number | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<Answer | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [submittedPlayerIds, setSubmittedPlayerIds] = useState<Set<number>>(new Set());


  const handleRoundUpdate = useCallback((data: RoundData) => {
    setRound(data);
    if (data.roundId !== initializedRoundRef.current) {
      initializedRoundRef.current = data.roundId;
      setTimeLeft(data.timeLeft);
      setRoundEnded(false);
      hasSubmitted.current = false;
      setSubmittedAnswer(null);
      setSubmittedPlayerIds(new Set());
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      apiService.get<{ submittedPlayerIds: number[] }>(
        `/lobbies/${lobbyCode}/rounds/${data.roundId}/summary`
      )
        .then(summary => {
          if (summary.submittedPlayerIds?.length) {
            setSubmittedPlayerIds(new Set(summary.submittedPlayerIds.map(Number)));
          }
        })
        .catch(() => {});
    }
  }, [lobbyCode]);

  const handlePinPlaced = useCallback(
    async (pin: { lat: number; lng: number }) => {
      if (!round || hasSubmitted.current) return;
      hasSubmitted.current = true; 
      const answer = await apiService.post<Answer>(
        `/lobbies/${lobbyCode}/rounds/${round.roundId}/answers`,
        { playerId: Number(userId), latitude: pin.lat, longitude: pin.lng }
      );
      setSubmittedAnswer(answer);
    },
    [round, lobbyCode, userId]
  );

  useWebSocket<RoundData>(`/topic/game/${lobbyCode}/image`, handleRoundUpdate);

  const handleTimerUpdate = useCallback((val: number) => {
    setTimeLeft(val);
  }, []);

  const handleRoundEnd = useCallback(() => {
    setRoundEnded(true);
    console.log("Round ended received from server");
  }, []);
  useWebSocket<string>(`/topic/game/${lobbyCode}/roundEnd`, handleRoundEnd);

  useWebSocket<number>(`/topic/game/${lobbyCode}/timer`, handleTimerUpdate);
    
  const handleGameOver = useCallback(
    (msg: string) => {
      if (msg === "GAME_OVER") {
        router.push("/home");
      }
    },
    [router]
  );

  const handleRoundEndNavigation = useCallback((data: RoundSummaryData) => {
    sessionStorage.setItem("roundSummary", JSON.stringify(data));
    router.push(`/game/${lobbyCode}/round-summary`);
  }, [router, lobbyCode]);

  useWebSocket<RoundSummaryData>(`/topic/lobby/${lobbyCode}/summary`, handleRoundEndNavigation);

  useWebSocket<string>(`/topic/game/${lobbyCode}/status`, handleGameOver);

  const handleDisconnect = useCallback(
    () => {
      if (isHost) return;
      setHostLeft(true);
      disconnectTimerRef.current = setTimeout(() => router.push("/home"), 3000);
    },
    [router, isHost]
  );
  useWebSocket<string>(`/topic/lobby/${lobbyCode}/disconnect`, handleDisconnect);
  
  const handleScoresUpdate = useCallback((data: Player[]) => {
    setPlayers(data);
  }, []);
  
  useWebSocket<Player[]>(`/topic/lobby/${lobbyCode}/scores`, handleScoresUpdate);

  const handleSubmissionUpdate = useCallback((data: SubmissionUpdateDTO) => {
    setSubmittedPlayerIds(prev => {
      const next = new Set(prev);
      next.add(data.playerId);
      return next;
    });
  }, []);
  
  useWebSocket<SubmissionUpdateDTO>(`/topic/lobbies/${lobbyCode}/submissions`, handleSubmissionUpdate);
  
  useEffect(() => {
    return () => {
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) setRoundEnded(true);
  }, [timeLeft]);

  useEffect(() => {
    apiService.get<string[]>(`/lobbies/${lobbyCode}/players`)
      .then(names => setPlayers(names.map(name => ({ id: 0, username: name, totalScore: 0, connected: true }))))
      .catch(() => {});
  }, [lobbyCode]);
  

  useEffect(() => {
    if (roundEnded && submittedAnswer) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setSubmittedAnswer(null), 3000);
    }
  }, [roundEnded, submittedAnswer]);
  

  return (
    <main className={styles.gameLayout}>
      {hostLeft && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems:
"center", justifyContent: "center", zIndex: 100 }}>
          <p style={{ color: "#ff4d4f", fontSize: "20px", fontWeight: 700 }}>
            The host has disconnected. Redirecting to home...
          </p>
        </div>
      )}
      {roundEnded && submittedAnswer && (
      <div
        className={`${styles.scoreFeedbackToast} ${
          submittedAnswer.scoreResult === "CORRECT_CITY"
            ? styles.scoreFeedbackCorrectCity
            : submittedAnswer.scoreResult === "CORRECT_COUNTRY"
            ? styles.scoreFeedbackCorrectCountry
            : styles.scoreFeedbackIncorrect
        }`}
      >
        <div className={styles.scoreFeedbackLabel}>
          <span className={
            submittedAnswer.scoreResult === "CORRECT_CITY"
              ? styles.dotGreen
              : submittedAnswer.scoreResult === "CORRECT_COUNTRY"
              ? styles.dotYellow
              : styles.dotRed
          }>●</span>
          {submittedAnswer.scoreResult === "CORRECT_CITY"
            ? "Correct City!"
            : submittedAnswer.scoreResult === "CORRECT_COUNTRY"
            ? "Correct Country"
            : "Wrong Location"}
        </div>
        {round?.correctCity && (
          <div className={styles.scoreFeedbackCity}>{round.correctCity}</div>
        )}
        <div className={styles.scoreFeedbackPoints}>
          +{submittedAnswer.pointsAwarded} pts
        </div>
      </div>
    )}

        <div className={styles.gameRow}>
          <div className={styles.gameSidebar}>
            <div className={styles.cornerLogo} style={{ position: "static" }}>
              Geo<span>Guess</span>
            </div>
            <div className={styles.scoringBox}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className={styles.playerAvatar}>
                    {username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={styles.settingLabel}>{username}</span>
                </div>
                  {timeLeft !== null && (
                  <span style={{ color: "#f4941b", fontWeight: 700, fontSize: "18px" }}>
                    {timeLeft}s
                  </span>
                )}
              </div>
            </div>
            {players.length > 0 && (
              <div className={styles.scoreboardBox}>
                {[...players]
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((player, index) => (
                    <div key={player.username} className={styles.scoreboardEntry}>
                      <span className={styles.scoreboardRank}>#{index + 1}</span>
                      <span className={submittedPlayerIds.has(player.id)
                        ? styles.submissionIndicatorSubmitted
                        : styles.submissionIndicatorPending
                      }>●</span>
                      <span className={styles.scoreboardName}>{player.username}</span>
                      <span className={styles.scoreboardScore}>{player.totalScore}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className={styles.gameContent}>
            {round && (
              <div style={{ color: "#6b7280", fontSize: "14px", fontWeight: 700, textAlign: "right" }}>
                Round {round.roundNumber} / {round.totalRounds}
              </div>
            )}
            <div className={styles.gameImageWrapper}>
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
              <GameMap roundNumber={round?.roundNumber ?? 0} onPinPlaced={handlePinPlaced} disabled={roundEnded}/>
            </div>
          </div>
        </div>
    </main>
  );
};

export default GameRound;