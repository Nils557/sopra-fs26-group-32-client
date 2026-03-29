"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import styles from "@/styles/page.module.css";
import useLocalStorage from "@/hooks/useLocalStorage";

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { set: setUserId } = useLocalStorage<string>("userId", "");
  const { set: setUsername } = useLocalStorage<string>("username", "");
  
  // State of error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null); // delete error if tried again
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    try {
      const user = await apiService.post<User>("/users", { username: name }); //username is passed, not name
      setUserId(String(user.id));
      setUsername(String(user.username));
      router.push("/home");
    } catch (error: unknown) {

      setErrorMsg(null); 

      let status: number | null = null;

      if (error instanceof Error) {
        // Extracts status code from message like "(409: {...})"
        const match = error.message.match(/\((\d{3}):/);
        if (match) {
          status = parseInt(match[1], 10);
        }
      }

      //console.log("Caught error:", error);

      if (status === 409) {
        setErrorMsg("Username already taken.");
      } else if (status !== null) {
        setErrorMsg(`Server error: ${status}`);
      } else {
        setErrorMsg("Could not connect to server.");
      }
    } 
  };

  return (
    <main className={styles.fullPageContainer}>
      <div className={styles.cornerLogo}>
        Geo<span>Guess</span>
      </div>

      <div className={styles.centerWrapper}>
        <div className={styles.heroText}>
          <h1 className={styles.hugeTitle}>Guess the City.</h1>
          <p className={styles.hugeSubtitle}>Pick a username to get started.</p>
        </div>
        <div className={styles.loginCard}>
          <form onSubmit={handleLogin} className={styles.form}>
            <input
              name="name"
              className={styles.largeInput}
              placeholder="Enter username"
              required
              autoFocus
            />
            
            {errorMsg && (
              <p style={{ color: "#ff4d4f", fontSize: "14px", marginTop: "-10px", textAlign: "left" }}>
                {errorMsg}
              </p>
            )}

            <button type="submit" className={styles.largeButton}>
              Enter game →
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;