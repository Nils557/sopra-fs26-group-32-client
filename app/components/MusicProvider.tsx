"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import useWindowSize from "@/hooks/useWndowSize";

export default function MusicProvider() {
const pathname = usePathname();
const lobbyAudio = useRef<HTMLAudioElement | null>(null);
const gameAudio = useRef<HTMLAudioElement | null>(null);
const gongAudio = useRef<HTMLAudioElement | null>(null);
const victoryAudio = useRef<HTMLAudioElement | null>(null);
const musicMutedRef = useRef(false);
const clicksMutedRef = useRef(false);

const [musicMuted, setMusicMuted] = useState(false);
const [clicksMuted, setClicksMuted] = useState(false);
const [showPanel, setShowPanel] = useState(false);
const { isMobile } = useWindowSize();

const isGame = pathname.startsWith("/game");

useEffect(() => { musicMutedRef.current = musicMuted; }, [musicMuted]);
useEffect(() => { clicksMutedRef.current = clicksMuted; }, [clicksMuted]);

useEffect(() => {
if (localStorage.getItem("musicMuted") === "true") setMusicMuted(true);
if (localStorage.getItem("clicksMuted") === "true") setClicksMuted(true);
}, []);

useEffect(() => {
    if (!showPanel) return;
    const handleOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-sound-panel]")) {
        setShowPanel(false);
    }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
}, [showPanel]);

useEffect(() => {
    lobbyAudio.current = new Audio("/musicwallah-no-copyright-lobby.mp3");
    lobbyAudio.current.loop = true;
    lobbyAudio.current.volume = 0.4;

    gameAudio.current = new Audio("/musicwallah-no-copyright-game.mp3");
    gameAudio.current.loop = true;
    gameAudio.current.volume = 0.4;

    const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") && !clicksMutedRef.current) {
        const click = new Audio("/nilsclick.mp3");
        click.volume = 1.0;
        click.play().catch(() => {});
    }
    };
    window.addEventListener("click", handleClick);

    return () => {
    lobbyAudio.current?.pause();
    gameAudio.current?.pause();
    window.removeEventListener("click", handleClick);
    };
}, []);

useEffect(() => {
    const lobby = lobbyAudio.current;
    const game = gameAudio.current;
    if (!lobby || !game) return;

    const isGamePage = pathname.startsWith("/game");

    let lobbyResume: (() => void) | null = null;
    let gameResume: (() => void) | null = null;

    if (isGamePage) {
    lobby.pause();
    const isMainGamePage = /^\/game\/[^/]+$/.test(pathname);
    if (isMainGamePage && !clicksMutedRef.current) {
        const gong = new Audio("/freesound-gong.mp3");
        gong.volume = 0.4;
        gong.play().catch(() => {});
        gongAudio.current = gong; 
    }
    const isFinalResults = /^\/game\/[^/]+\/final-results$/.test(pathname);
    if (isFinalResults) {
        game.pause(); 
        if (!clicksMutedRef.current) {
        const victory = new Audio("/cyreljayvillaro-victory.mp3");
        victory.volume = 0.8;
        victory.play().catch(() => {});
        victoryAudio.current = victory; 
        }
    }
    if (!musicMutedRef.current && !isFinalResults) {
        game.play().catch(() => {
        gameResume = () => { if (!musicMutedRef.current) game.play().catch(() => {}); };
        window.addEventListener("click", gameResume, { once: true });
        });
    }
    } else {
    game.pause();
    if (!musicMutedRef.current && pathname !== "/") {
        lobby.play().catch(() => {
        lobbyResume = () => { if (!musicMutedRef.current) lobby.play().catch(() => {}); };
        window.addEventListener("click", lobbyResume, { once: true });
        });
    }
    }

    return () => {
    if (lobbyResume) window.removeEventListener("click", lobbyResume);
    if (gameResume) window.removeEventListener("click", gameResume);
    gongAudio.current?.pause();
    victoryAudio.current?.pause();
    };
}, [pathname]);

useEffect(() => {
    const lobby = lobbyAudio.current;
    const game = gameAudio.current;
    if (!lobby || !game) return;

    const isFinalResults = /^\/game\/[^/]+\/final-results$/.test(pathname);

    if (musicMuted) {
    lobby.pause();
    game.pause();
    } else {
    if (pathname.startsWith("/game") && !isFinalResults) {
        game.play().catch(() => {});
    } else if (!pathname.startsWith("/game")) {
        lobby.play().catch(() => {});
    }
    }
}, [musicMuted, pathname]);

return (
    <>
    {!isGame && pathname !== "/" && (
        <div data-sound-panel="true" style={{ position: "fixed", top: isMobile ? "auto" : "20px", bottom:
isMobile ? "80px" : "auto", right: "20px", zIndex: 1000 }}>
            {showPanel && (
            <div style={{
                position: "absolute", top: isMobile ? "auto" : "54px", bottom: isMobile ? "54px" : "auto",
right: 0,
                background: "#1e2940", border: "1px solid #2e3f5c",
                borderRadius: "10px", padding: "12px",
                display: "flex", flexDirection: "column", gap: "8px",
                minWidth: "140px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
            }}>
            <button
                onClick={() => {
                const newVal = !musicMuted;
                localStorage.setItem("musicMuted", String(newVal));
                setMusicMuted(newVal);
                }}
                style={{
                background: musicMuted ? "#2a2a2a" : "#22426b",
                color: musicMuted ? "#888" : "#fff",
                border: "none", borderRadius: "6px", padding: "8px 12px",
                cursor: "pointer", fontWeight: 700, fontSize: "13px",
                textDecoration: musicMuted ? "line-through" : "none"
                }}
            >
                Music
            </button>
            <button
                onClick={() => {
                const newVal = !clicksMuted;
                localStorage.setItem("clicksMuted", String(newVal));
                setClicksMuted(newVal);
                }}
                style={{
                background: clicksMuted ? "#2a2a2a" : "#22426b",
                color: clicksMuted ? "#888" : "#fff",
                border: "none", borderRadius: "6px", padding: "8px 12px",
                cursor: "pointer", fontWeight: 700, fontSize: "13px",
                textDecoration: clicksMuted ? "line-through" : "none"
                }}
            >
                Soundeffects
            </button>
            </div>
        )}
        <button
            onClick={() => setShowPanel(p => !p)}
            style={{
            background: "#22426b", color: "#fff", border: "none",
            borderRadius: "50%", width: "44px", height: "44px",
            cursor: "pointer", fontSize: "20px", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
            }}
        >
            🔊
        </button>
        </div>
    )}
    </>
);
}