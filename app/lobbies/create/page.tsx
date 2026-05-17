"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
import { ApplicationError } from "@/types/error";
import useSessionStorage from "@/hooks/useSessionStorage";

interface LobbyCreateResponse {
  lobbyCode: string;
}

const CreateLobby: React.FC = () => {
  const router = useRouter();

  const [rounds, setRounds] = useState(4);
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const apiService = useApi();
  const { value: userId } = useSessionStorage<string>("userId", "");
  const { value: username } = useSessionStorage<string>("username", "");
  const { set: setMaxPlayersStorage } = useSessionStorage<string>("maxPlayers", "");
  const { set: setIsHost } = useSessionStorage<string>("isHost", "false");
  const { set: setHostUsername } = useSessionStorage<string>("hostUsername", "");

  const handleCreation = async () => {
    setErrorMsg(null);
    try {
      const lobby = await apiService.post<LobbyCreateResponse>("/lobbies", {
        hostUserId: Number(userId),
        maxPlayers: maxPlayers,
        totalRounds: rounds,
      });
      setMaxPlayersStorage(String(maxPlayers));
      setIsHost("true");
      setHostUsername(username);
      router.push(`/lobbies/${lobby.lobbyCode}`);
    } catch (error: unknown) {
      const status = (error as ApplicationError)?.status ?? null;
      if (status === 400) setErrorMsg("Invalid lobby settings.");
      else if (status === 404) setErrorMsg("Your user account was not found.");
      else if (status !== null) setErrorMsg(`Server error: ${status}`);
      else setErrorMsg("Could not connect to server.");
    }
  };

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <div className={styles.centerWrapper}>
        <div className={styles.heroText}>
          <h1 className={styles.hugeTitle}>Lobby settings</h1>
        </div>

        <form
          className={styles.loginCard}
          onSubmit={(e) => {
            e.preventDefault();
            handleCreation();
          }}
        >
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
              <span className={styles.dotGreen}>●</span> Correct city — 2000 Points
            </p>
            <p className={styles.scoringItem}>
              <span className={styles.dotYellow}>●</span> Correct country — 1000 - 1999 points
            </p>
            <p className={styles.scoringItem}>
              <span className={styles.dotRed}>●</span> 1000km radius - 0 - 999 Points
            </p>
            <p style={{ color: "#4b5563", fontSize: "12px", marginTop: "8px" }}>
              Points scale with distance accuracy and time remaining.
            </p>
          </div>

          {errorMsg && (
            <p
              style={{
                color: "#ff4d4f",
                fontSize: "14px",
                marginTop: "-10px",
                textAlign: "left",
              }}
            >
              {errorMsg}
            </p>
          )}

          <button type="submit" className={styles.createButton}>
            Create Lobby
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreateLobby;
