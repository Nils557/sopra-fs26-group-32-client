  "use client";

  import { useCallback, useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import styles from "@/styles/page.module.css";
  import useLocalStorage from "@/hooks/useLocalStorage";
  import { useParams } from "next/navigation";
  import { useWebSocket } from "@/hooks/useWebSocket";
  import { useApi } from "@/hooks/useApi";

  const WaitingRoom: React.FC = () => {
    const router = useRouter();
    const { value: username } = useLocalStorage<string>("username", "");
    const avatarInitials = typeof username === "string" ? username.substring(0, 2).toUpperCase() : "";
    const params = useParams();
    const lobbyCode = params.code as string;
    const { value: maxPlayersStr } = useLocalStorage<string>("maxPlayers", "0");
    const maxPlayers = Number(maxPlayersStr);
    const [hostLeft, setHostLeft] = useState(false);
    const [players, setPlayers] = useState<string[]>([]);
    const apiService = useApi();
    const { value: playerId } = useLocalStorage<string>("playerId", "");

    useEffect(() => {
      const fetchPlayers = async () => {
          try {
              const playerList = await apiService.get<string[]>(`/lobbies/${lobbyCode}/players`);
              setPlayers(playerList);
          } catch (error) {
              console.error("Failed to fetch players:", error);
          }
      };
        fetchPlayers();
    }, [lobbyCode, apiService]);

    const handleWsMessage = useCallback((msg: string) => {
      if (msg === "HOST_DISCONNECTED") {
        setHostLeft(true);
        setTimeout(() => router.push("/home"), 3000);
      }
    }, [router]);

    useWebSocket<string>("/topic/lobby/updates", handleWsMessage);
    
    const handlePlayersUpdate = useCallback((playerList: string[]) => {
      setPlayers(playerList);
    }, []);
    
    useWebSocket<string[]>(`/topic/lobby/${lobbyCode}/players`, handlePlayersUpdate);

    //wenn backend DELETE /lobbies macht chömmer das use
    //const handleLeave = async () => {
    //  try {
     //     await apiService.delete(`/lobbies/${lobbyCode}/players/${playerId}`);
      //    router.push("/home");
      //} catch (error) {
     //    console.error("Failed to leave lobby:", error);
     // }
   // };

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

            {hostLeft && (
              <p style={{ color: "#ff4d4f", textAlign: "center", marginBottom: "12px" }}>
                The host has disconnected. Redirecting to home...
              </p>
            )}

            <div className={styles.scoringBox}>
              <p className={styles.scoringTitle}>Players ({players.length > 0 ? players.length : 1}/ {maxPlayers})</p>

              {players.length > 0 ? (
                  players.map((playerName, index) => (
                      <div className={styles.settingRow} key={index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div className={styles.playerAvatar}>
                                  {playerName.substring(0, 2).toUpperCase()}
                              </div>
                              <span className={styles.settingLabel}>{playerName}</span>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className={styles.settingRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className={styles.playerAvatar}>{avatarInitials}</div>
                          <span className={styles.settingLabel}>{username}</span>
                      </div>
                      <div className={styles.hostBadge}>HOST</div>
                  </div>
              )}
            </div>

            <button
              className={`${styles.createButton} ${styles.disabledButton}`}
              disabled
            >
              Start Game
            </button>

            {/* wenn backend DELETE/lobbies macht, chömmer das use
            <button className={styles.largeButton} onClick={handleLeave}>
            Leave Lobby
            </button>
            */}
          </div>
        </div>
      </main>
    );                                                                                                                                                                                                      };
                                                                                                                                                                                                          
  export default WaitingRoom;