"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";

interface Player {
  id: number;
  username: string;
  totalScore: number;
  connected: boolean;
}

interface FinalResults {
  lobbyCode: string;
  standings: Player[];
}

interface RankedPlayer extends Player {
  rank: number;
}

function computeRanks(standings: Player[]): RankedPlayer[] {
  const sorted = [...standings].sort((a, b) => b.totalScore - a.totalScore);
  return sorted.map((player) => {
    const rank = sorted.findIndex((p) => p.totalScore === player.totalScore) + 1;
    return { ...player, rank };
  });
}

export default function FinalResults() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const api = useApi();

  const [results, setResults] = useState<FinalResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<FinalResults>(`/lobbies/${code}/results`)
      .then((data) => setResults((prev) => prev ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api, code]);

  const handleResults = useCallback((data: FinalResults) => {
    setResults(data);
    setLoading(false);
  }, []);

  useWebSocket<FinalResults>(`/topic/lobby/${code}/results`, handleResults);

  const ranked = results ? computeRanks(results.standings) : [];
  const winners = ranked.filter((p) => p.rank === 1);

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <div className={styles.centerWrapper} style={{ maxWidth: 500 }}>
        {loading && !results && (
          <p style={{ color: "#6b7280", textAlign: "center" }}>Loading results…</p>
        )}

        {results && winners.length > 0 && (
          <div className={styles.winnerSection}>
            <div className={styles.winnerCrown}>🏆</div>
            <div className={styles.winnerLabel}>Winner</div>
            <div className={styles.winnerNameText}>
              {winners.map((w) => w.username).join(" & ")} wins!
            </div>
          </div>
        )}

        {results && (
          <div className={styles.finalResultsCard}>
            <div className={styles.rankingsTitle}>Final Rankings</div>
            {ranked.map((player) => (
              <div
                key={player.id}
                className={`${styles.rankingRow}${player.rank === 1 ? ` ${styles.rankingRowWinner}` : ""}`}
              >
                <span
                  className={`${styles.rankBadge}${player.rank === 1 ? ` ${styles.rankBadgeGold}` : ""}`}
                >
                  {player.rank}
                </span>
                <span className={styles.rankUsername}>{player.username}</span>
                <span className={styles.rankScore}>{player.totalScore}</span>
              </div>
            ))}
          </div>
        )}

        <button
          className={styles.returnButton}
          onClick={() => router.push("/home")}
        >
          ← Return to Home
        </button>
      </div>
    </main>
  );
}
