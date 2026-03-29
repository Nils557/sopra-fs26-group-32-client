"use client";

import styles from "@/styles/page.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";

const WaitingRoom: React.FC = () => {
  const { value: username } = useLocalStorage<string>("username", "");
  const avatarInitials = typeof username === "string" ? username.substring(0, 2).toUpperCase() : "";
  const lobbyCode = "CODE-HERE"; //hardcoded for now

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
            <p className={styles.scoringTitle}>Players</p>

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