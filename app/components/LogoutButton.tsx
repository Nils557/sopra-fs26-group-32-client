"use client";

import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { useWSContext } from "@/contexts/WebSocketContext";

const LogoutButton: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const { disconnect } = useWSContext();

  const handleLogout = async (): Promise<void> => {
    const rawUserId = sessionStorage.getItem("userId")?.replace(/"/g, "");
    if (rawUserId) {
      try {
        await apiService.delete(`/users/${rawUserId}`);
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    disconnect(); // close WebSocket before clearing session
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("playerId");
    sessionStorage.removeItem("maxPlayers");
    sessionStorage.removeItem("isHost");
    sessionStorage.removeItem("hostUsername");
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "12px 24px",
        fontSize: "15px",
        fontWeight: 700,
        cursor: "pointer",
        zIndex: 9999,
      }}
    >
      Logout
    </button>
  );
};

export default LogoutButton;