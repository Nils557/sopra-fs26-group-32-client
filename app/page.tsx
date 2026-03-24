"use client";

import { useState } from "react"; 
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import styles from "@/styles/page.module.css";

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  
  // State of error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null); // delete error if tried again
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    try {
      await apiService.post<User>("/users", { name });
      router.push("/users");
    } catch (error: any) {
      // No alert, it wrties it onto the page
      const message = error.response?.data?.message || "Username already taken!";
      setErrorMsg(message);
      console.error(error);
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