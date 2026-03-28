"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import styles from "@/styles/page.module.css";

const Home: React.FC = () => {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleJoin = () => {
        setErrorMsg(null);
        if (!lobbyCode.trim()) {
          setErrorMsg("Please enter a lobby code.");
          return;
        }
        router.push(`/lobbies/${lobbyCode.trim()}`);
      };

      return (
        <main className={styles.fullPageContainer}>
          <div className={styles.cornerLogo}>
            Geo<span>Guess</span>
          </div>
    
          <div className={styles.centerWrapper}>
            <div className={styles.heroText}>
              <h1 className={styles.hugeTitle}>Welcome back.</h1>
              <p className={styles.hugeSubtitle}>Create a lobby or join with a code.</p>
            </div>
    
            <div className={styles.loginCard}>
              <button
                className={styles.createButton}
                onClick={() => router.push("/lobbies/create")}
              >
                + Create Lobby
              </button>
    
              <div className={styles.divider}>
                <span>or join with a code</span>
              </div>
    
              <div className={styles.joinRow}>
                <input
                  className={styles.largeInput}
                  placeholder="Enter lobby code..."
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value)}
                />
                <button className={styles.joinButton} onClick={handleJoin}>
                  Join
                </button>
              </div>
    
              {errorMsg && (
                <p style={{ color: "#ff4d4f", fontSize: "14px", marginTop: "8px", textAlign: "left" }}>
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        </main>
      );
    };
    export default Home;