 "use client";

  import { useCallback, useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import { useParams } from "next/navigation";
  import dynamic from "next/dynamic";
  import styles from "@/styles/page.module.css";
  import { useWebSocket } from "@/hooks/useWebSocket";

  const SummaryMap = dynamic(() => import("@/components/SummaryMap"), { ssr: false });

  interface RoundSummaryData {
    correctCity: string;
    correctLatitude: number;
    correctLongitude: number;
    standings: { username: string; totalScore: number }[];
  }

  export default function RoundSummary() {
    const router = useRouter();
    const params = useParams();
    const code = params.code as string;

    const [data, setData] = useState<RoundSummaryData | null>(null);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
      const stored = sessionStorage.getItem("roundSummary");
      if (stored) setData(JSON.parse(stored));
    }, []);

    useEffect(() => {
      const start = Date.now();
      const id = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 100 - (elapsed / 10000) * 100);
        setProgress(remaining);
        if (remaining === 0) clearInterval(id);
      }, 50);
      return () => clearInterval(id);
    }, []);

    const handleGameState = useCallback(
      (msg: string) => {
        if (msg === "NEXT_ROUND") router.push(`/game/${code}`);
        if (msg === "GAME_END") router.push("/home");
      },
      [router, code]
    );

    useWebSocket<string>(`/topic/lobby/${code}/game-state`, handleGameState);

    if (!data) return null;

    return (
      <main className={styles.fullPageContainer}>
        <h1 className={styles.hugeTitle}>{data.correctCity}</h1>
        <div className={styles.summaryContent}>
          <div className={styles.summaryMapColumn}>
            <div className={styles.summaryMapWrapper}>
              <SummaryMap lat={data.correctLatitude} lng={data.correctLongitude} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, height: "4px", background: "#1e2940", borderRadius: "0 0 6px 6px" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "#f4941b", borderRadius: "0 0 6px 6px", transition: "width 0.05s linear" }} />
              </div>
              <span style={{ color: "#f4941b", fontSize: "12px", fontWeight: 700, minWidth: "20px" }}>
                {Math.ceil((progress / 100) * 10)}s
              </span>
            </div>
          </div>
          <div className={styles.scoreboardBox}>
            {[...data.standings]
              .sort((a, b) => b.totalScore - a.totalScore)
              .map((player, index) => (
                <div key={player.username} className={styles.scoreboardEntry}>
                  <span className={styles.scoreboardRank}>#{index + 1}</span>
                  <span className={styles.scoreboardName}>{player.username}</span>
                  <span className={styles.scoreboardScore}>{player.totalScore}</span>
                </div>
              ))}
          </div>
        </div>
      </main>
    );
  }