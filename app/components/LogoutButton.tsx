"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useRouter, usePathname } from "next/navigation";
import { useWSContext } from "@/contexts/WebSocketContext";
import styles from "./LogoutButton.module.css";

const LogoutButton: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const pathname = usePathname();
  const { disconnect } = useWSContext();
  const [userId, setUserId] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("userId");
    setUserId(stored ? stored.replace(/"/g, "") : "");
  }, [pathname]);

  if (!userId) return null;

  const handleLogout = async (): Promise<void> => {
    setBusy(true);
    try {
      await apiService.delete(`/users/${userId}`);
    } catch (error) {
      console.error("Failed to delete user on logout:", error);
    } finally {
      disconnect();
      sessionStorage.clear();
      setUserId("");
      setBusy(false);
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={busy}
      className={styles.logoutButton}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
