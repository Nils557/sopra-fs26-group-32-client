"use client";

  import { useCallback, useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import { useParams } from "next/navigation";
  import styles from "@/styles/page.module.css";
  import useLocalStorage from "@/hooks/useLocalStorage";
  import { useWebSocket } from "@/hooks/useWebSocket";
  import LocationImage from "@/components/LocationImage";

  // Type fürd rundeinfos vum server
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

    const { value: username } = useLocalStorage<string>("username", "");

    // aktuelli rundestate, null solang de server no nüt gschickt het
    const [round, setRound] = useState<RoundData | null>(null);

    // wenn de Server e neui rundi startet wirds da empfange
    const handleRoundUpdate = useCallback((data: RoundData) => {
      setRound(data);
    }, []);

    useWebSocket<RoundData>(`/topic/game/${lobbyCode}/image`, handleRoundUpdate); //apasse falls s backend neumet andersch aneschickt

    // wenns spiel fertig isch schickemers zrugg id lobby
    const handleGameOver = useCallback((msg: string) => {
      if (msg === "GAME_OVER") {
        router.push("/home");
      }
    }, [router]);

    useWebSocket<string>(`/topic/game/${lobbyCode}/status`, handleGameOver);

    return (
      <main className={styles.fullPageContainer}>
        <div className={styles.cornerLogo}>
          Geo<span>Guess</span>
        </div>

        {/*Rundeinfo */}
        {round && (
          <div style={{ position: "absolute", top: "30px", right: "40px", color: "#6b7280", fontSize: "14px",
  fontWeight: 700 }}>
            Round {round.roundNumber} / {round.totalRounds}
          </div>
        )}

        <div style={{ width: "100%", maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Hauptbild vude aktuelle rundi */}
          {round ? (
            <LocationImage imageUrl={round.imageUrl} />
          ) : (
            // Platzhalter
            <div style={{
              width: "100%",
              aspectRatio: "16/9",
              background: "#151c2c",
              borderRadius: "16px",
              border: "1px solid #1e2940",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: "16px"
            }}>
              Warte auf die erste Runde...
            </div>
          )}

          {/* Infobox mit Spielername und Ziit */}
          <div className={styles.scoringBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Avatar */}
                <div className={styles.playerAvatar}>
                  {username.substring(0, 2).toUpperCase()}
                </div>
                <span className={styles.settingLabel}>{username}</span>
              </div>
              {/* timer */}
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