"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/page.module.css";
import { useApi } from "@/hooks/useApi";
import useSessionStorage from "@/hooks/useSessionStorage";

const Home: React.FC = () => {
  const router = useRouter();
  const [lobbyCode, setLobbyCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const apiService = useApi();
  const { value: userId } = useSessionStorage<string>("userId", "");

  const handleJoin = async () => {
    setErrorMsg(null);
    if (!lobbyCode.trim()) {
      setErrorMsg("Please enter a lobby code.");
      return;
    }

    try {
      await apiService.post(`/lobbies/${lobbyCode.trim()}/players`, {
        userId: Number(userId),
      });
      router.push(`/lobbies/${lobbyCode.trim()}`);
    } catch (error: unknown) {
      let status: number | null = null;
      if (error instanceof Error) {
        const match = error.message.match(/\((\d{3}):/);
        status = match ? parseInt(match[1], 10) : null;
      }

      if (status === 404) setErrorMsg("Lobby not found.");
      else if (status === 409) setErrorMsg("Lobby is full.");
      else if (status === 403) setErrorMsg("Game has already started.");
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

          <form
            className={styles.joinRow}
            onSubmit={(e) => {
              e.preventDefault();
              handleJoin();
            }}
          >
            <input
              className={styles.largeInput}
              placeholder="Enter lobby code..."
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value)}
            />
            <button type="submit" className={styles.joinButton}>
              Join
            </button>
          </form>

          {errorMsg && (
            <p
              style={{
                color: "#ff4d4f",
                fontSize: "14px",
                marginTop: "8px",
                textAlign: "left",
              }}
            >
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
