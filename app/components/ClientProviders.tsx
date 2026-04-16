"use client";

import { ReactNode } from "react";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import LogoutButton from "@/components/LogoutButton";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WebSocketProvider>
      <LogoutButton />
      {children}
    </WebSocketProvider>
  );
}
