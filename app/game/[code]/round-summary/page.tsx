 "use client";

  import { useEffect, useState } from "react";
  import dynamic from "next/dynamic";
  import styles from "@/styles/page.module.css";

  const SummaryMap = dynamic(() => import("@/components/SummaryMap"), { ssr: false });

  interface RoundSummaryData {
    correctCity: string;
    correctLatitude: number;
    correctLongitude: number;
    standings: { username: string; totalScore: number }[];
  }

  export default function RoundSummary() {
    const [data, setData] = useState<RoundSummaryData | null>(null);

    useEffect(() => {
      const stored = sessionStorage.getItem("roundSummary");
      if (stored) setData(JSON.parse(stored));
    }, []);

    if (!data) return null;

    return (
      <main className={styles.fullPageContainer}>
        <h1 className={styles.hugeTitle}>{data.correctCity}</h1>
        <div className={styles.summaryMapWrapper}>
          <SummaryMap lat={data.correctLatitude} lng={data.correctLongitude} />
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
      </main>
    );
  }