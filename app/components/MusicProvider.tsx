"use client";

  import { useEffect, useRef } from "react";
  import { usePathname } from "next/navigation";

  export default function MusicProvider() {
    const pathname = usePathname();
    const lobbyAudio = useRef<HTMLAudioElement | null>(null);
    const gameAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      lobbyAudio.current = new Audio("/musicwallah-no-copyright-lobby.mp3");
      lobbyAudio.current.loop = true;
      lobbyAudio.current.volume = 0.4;

      gameAudio.current = new Audio("/musicwallah-no-copyright-game.mp3");
      gameAudio.current.loop = true;
      gameAudio.current.volume = 0.4;

      return () => {
        lobbyAudio.current?.pause();
        gameAudio.current?.pause();
      };
    }, []);

    useEffect(() => {
      const lobby = lobbyAudio.current;
      const game = gameAudio.current;
      if (!lobby || !game) return;

      const isGame = pathname.startsWith("/game");

      if (isGame) {
        lobby.pause();
        const isMainGamePage = /^\/game\/[^/]+$/.test(pathname);
        if (isMainGamePage) {
            const gong = new Audio("/gong.mp3");
            gong.volume = 0.8;
            gong.play().catch(() => {});
        }
        game.play().catch(() => {
        const resume = () => {
            game.play().catch(() => {});
            window.removeEventListener("click", resume);
        };
        window.addEventListener("click", resume);
        });
    } else {
        game.pause();
        lobby.play().catch(() => {
        const resume = () => {
            lobby.play().catch(() => {});
            window.removeEventListener("click", resume);
        };
        window.addEventListener("click", resume);
        });
    }
    }, [pathname]);

    return null;
  }