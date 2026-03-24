"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import styles from "@/styles/page.module.css";
const Login: React.FC = () => {

  const handleLogin = 0

return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.topbar}>
          <div className={styles.logo}>Geo<span>Guess</span></div>
        </div>
        
        <div className={styles.content}>
          <h1 className={styles.title}>Guess the City.</h1>
          <p className={styles.subtitle}>Choose a nickname!</p>
          
          <form onSubmit={handleLogin}>
            <input 
              name="name"
              className={styles.inputField} 
              placeholder="Your name" 
              required 
              autoFocus
            />
            
            <button type="submit" className={styles.button}>
              Enter game
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;
