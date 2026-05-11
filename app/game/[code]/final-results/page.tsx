"use client";

import styles from "@/styles/page.module.css";
import { useRouter, useParams } from "next/navigation";

export default function FinalResults() {
    const router = useRouter();
    const params = useParams();
    const code = params.code as string;

return (
    <main className={styles.fullPageContainer}>
    <h1>Final Results</h1>
     <button
     className={styles.returnButton}
     onClick={() => router.push(`/lobbies/${code}`)}>
          Return to Lobby
        </button>
    </main>
);
}