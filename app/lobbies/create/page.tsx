"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

const CreateLobby: React.FC = () => {
  const router = useRouter();

  const [rounds, setRounds] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const apiService = useApi();
  const { value: userId } = useLocalStorage<string>("userId", "");

  const handleCreation = async () => {
    try {
      const response = await apiService.post<any>("/lobbies", {
        hostUserId: Number(userId),
        maxPlayers: maxPlayers,
        totalRounds: rounds,
      });
      router.push(`/lobbies/${response.lobbyCode}`);
    } catch (error) {
      console.error("Failed to create lobby:", error);
    }
  };

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <button
        className={styles.backButton}
        onClick={() => router.push("/home")}
      >
        ← Back
      </button>

      <div className={styles.centerWrapper}>
        <div className={styles.heroText}>
          <h1 className={styles.hugeTitle}>Lobby settings</h1>
        </div>

        <form className={styles.loginCard} onSubmit={(e) => {e.preventDefault(); handleCreation();}}>
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Rounds</label>
            <div className={styles.sliderGroup}>
              <input
                type="range"
                min={1}
                max={10}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{rounds}</span>
            </div>
          </div>

          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Max players</label>
            <div className={styles.sliderGroup}>
              <input
                type="range"
                min={2}
                max={10}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.sliderValue}>{maxPlayers}</span>
            </div>
          </div>

          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Round time</label>
            <span className={styles.sliderValue}>45s</span>
          </div>

          <div className={styles.scoringBox}>
            <p className={styles.scoringTitle}>SCORING METHOD</p>
            <p className={styles.scoringItem}>
              <span className={styles.dotGreen}>●</span> Correct city — full points
            </p>
            <p className={styles.scoringItem}>
              <span className={styles.dotYellow}>●</span> Correct country — half points
            </p>
            <p className={styles.scoringItem}>
              <span className={styles.dotRed}>●</span> Otherwise — zero points
            </p>
          </div>

          <button type="submit" className={styles.createButton}>
            Create Lobby
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreateLobby;