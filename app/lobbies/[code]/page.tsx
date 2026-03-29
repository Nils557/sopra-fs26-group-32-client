"use client";

import styles from "@/styles/page.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useParams } from "next/navigation";

const WaitingRoom: React.FC = () => {
  const { value: username } = useLocalStorage<string>("username", "");
  const avatarInitials = typeof username === "string" ? username.substring(0, 2).toUpperCase() : "";
  const params = useParams();
  const lobbyCode = params.code as string;
  const { value: maxPlayersStr } = useLocalStorage<string>("maxPlayers", "0");
  const maxPlayers = Number(maxPlayersStr);

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <div className={styles.centerWrapper}>
        <div className={styles.loginCard}>

          <p className={styles.hugeSubtitle} style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>
            Share this code with friends
          </p>

          <h1 className={styles.hugeTitle} style={{ fontSize: "48px", letterSpacing: "6px" }}>
            {lobbyCode}
          </h1>

          <div className={styles.scoringBox}>
          <p className={styles.scoringTitle}>Players (1/{maxPlayers})</p>

            <div className={styles.settingRow}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className={styles.playerAvatar}>{avatarInitials}</div>
                <span className={styles.settingLabel}>{username}</span>
              </div>
              <div className={styles.hostBadge}>HOST</div>
            </div>
          </div>

          <button
            className={`${styles.createButton} ${styles.disabledButton}`}
            disabled
          >
            Start Game
          </button>

        </div>
      </div>
    </main>
  );
};

export default WaitingRoom;