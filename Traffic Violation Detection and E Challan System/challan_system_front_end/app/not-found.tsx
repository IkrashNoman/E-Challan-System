/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/not-found.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import NavBar from "./components/NavBar";

const STATIC_HIGH_SCORE = 123456;

type ObstacleType = "car" | "bike";
type Obstacle = {
  id: number;
  x: number;
  w: number;
  h: number;
  speed: number;
  type: ObstacleType;
};

export default function NotFoundWithGame() {
  const [gameVisible, setGameVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const highScore = STATIC_HIGH_SCORE;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const nextObstacleIdRef = useRef(1);
  const spawnTimerRef = useRef(0);
  const scoreTimerRef = useRef(0);
  const playTimeRef = useRef(0);
  const vyRef = useRef(0);
  const yRef = useRef(0);
  const runningRef = useRef(true);
  const dimsRef = useRef({ width: 800, height: 220 });

  const runAudioRef = useRef<HTMLAudioElement | null>(null);
  const crashAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  const GROUND_HEIGHT_PX = 18;
  const GAME_HEIGHT_PX = 220;
  const START_BIKE_LEFT_RATIO = 0.12;
  const INITIAL_SPAWN_INTERVAL_MS = 2000; // Increased for better spacing
  const MIN_SPAWN_INTERVAL_MS = 1000; // Increased minimum interval
  const INITIAL_OBS_SPEED = 0.3; // Slightly increased base speed
  const SPEED_INCREASE_PER_10S = 0.04;
  const GRAVITY = 0.0018;
  const BASE_BIKE_WIDTH = 120;
  const BASE_BIKE_HEIGHT = 80;
  const BASE_JUMP_VELOCITY = 0.65; // Increased for better jumping

  const [BIKE_DRAW_W, setBIKE_DRAW_W] = useState(BASE_BIKE_WIDTH);
  const [BIKE_DRAW_H, setBIKE_DRAW_H] = useState(BASE_BIKE_HEIGHT);
  const [JUMP_VELOCITY, setJumpVelocity] = useState(BASE_JUMP_VELOCITY);

  function startRunningSound() {
    stopCrashSound();
    if (!runAudioRef.current) {
      const audio = new Audio("/audio/bike_run.mp3");
      audio.loop = true;
      audio.volume = 0.5;
      audio.play().catch(() => {});
      runAudioRef.current = audio;
    }
  }

  function stopRunningSound() {
    if (runAudioRef.current) {
      runAudioRef.current.pause();
      runAudioRef.current.currentTime = 0;
      runAudioRef.current = null;
    }
  }

  function playCrashSound() {
    stopRunningSound();
    if (!crashAudioRef.current) {
      const audio = new Audio("/audio/bike_crash.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {});
      crashAudioRef.current = audio;
    } else {
      crashAudioRef.current.currentTime = 0;
      crashAudioRef.current.play().catch(() => {});
    }
  }

  function stopCrashSound() {
    if (crashAudioRef.current) {
      crashAudioRef.current.pause();
      crashAudioRef.current.currentTime = 0;
      crashAudioRef.current = null;
    }
  }

  function resetGameState() {
    obstaclesRef.current = [];
    nextObstacleIdRef.current = 1;
    spawnTimerRef.current = 0;
    scoreTimerRef.current = 0;
    playTimeRef.current = 0;
    vyRef.current = 0;
    yRef.current = 0;
    setScore(0);
    lastTimeRef.current = null;
    setGameOver(false);
    runningRef.current = true;
    stopRunningSound();
    stopCrashSound();
  }

  function beginGame() {
    resetGameState();
    setStarted(true);
    setGameVisible(true);
    startRunningSound();
  }

  useEffect(() => {
    setIsMobile(window.innerWidth <= 640);
    function handleResize() {
      setIsMobile(window.innerWidth <= 640);
      dimsRef.current.width = window.innerWidth;
      dimsRef.current.height = GAME_HEIGHT_PX;
      setBIKE_DRAW_W(isMobile ? 70 : BASE_BIKE_WIDTH);
      setBIKE_DRAW_H(isMobile ? 50 : BASE_BIKE_HEIGHT);
      setJumpVelocity(isMobile ? 0.55 : BASE_JUMP_VELOCITY);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);
  
  function jump() {
    if (yRef.current <= 0) {
      vyRef.current = JUMP_VELOCITY;
    }
  }

  function handleTapOrBikeClick(e?: React.MouseEvent) {
    if (!gameVisible) return beginGame();
    if (gameOver) {
      resetGameState();
      setStarted(true);
      runningRef.current = true;
      startRunningSound();
      return;
    }
    jump();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleTapOrBikeClick();
      } else if (e.code === "KeyP") {
        runningRef.current = !runningRef.current;
        if (runningRef.current) startRunningSound();
        else stopRunningSound();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameVisible, gameOver]);

  function spawnObstacle() {
    const w = dimsRef.current.width;
    
    // Ensure minimum distance from last obstacle
    if (obstaclesRef.current.length > 0) {
      const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
      const minDistance = isMobile ? 300 : 400; // Minimum distance between obstacles
      if (lastObstacle.x > w - minDistance) {
        return; // Don't spawn yet, wait for more space
      }
    }

    const type: ObstacleType = Math.random() < 0.6 ? "car" : "bike";
    
    // Increased obstacle sizes to be more proportional to bike
    const size = type === "car"
      ? { w: isMobile ? 60 : 100, h: isMobile ? 30 : 50 }
      : { w: isMobile ? 40 : 70, h: isMobile ? 25 : 40 };
    
    const base = INITIAL_OBS_SPEED + Math.floor(playTimeRef.current / 10000) * SPEED_INCREASE_PER_10S;
    const speed = base + Math.random() * 0.08 + Math.min(0.25, score / 1000);
    
    obstaclesRef.current.push({
      id: nextObstacleIdRef.current++,
      x: w + 20,
      w: size.w,
      h: size.h,
      speed,
      type,
    });
  }

  useEffect(() => {
    let mounted = true;
    function step(ts: number) {
      if (!mounted) return;
      if (!runningRef.current) {
        requestRef.current = requestAnimationFrame(step);
        return;
      }
      if (lastTimeRef.current == null) lastTimeRef.current = ts;
      const dt = ts - lastTimeRef.current;
      lastTimeRef.current = ts;
      if (!started) {
        requestRef.current = requestAnimationFrame(step);
        return;
      }

      playTimeRef.current += dt;
      spawnTimerRef.current += dt;
      scoreTimerRef.current += dt;

      const spawnInterval = Math.max(
        MIN_SPAWN_INTERVAL_MS,
        INITIAL_SPAWN_INTERVAL_MS - Math.floor(playTimeRef.current / 2000) * 25 // Slower difficulty increase
      );
      
      if (spawnTimerRef.current >= spawnInterval) {
        spawnObstacle();
        spawnTimerRef.current = 0;
      }

      // Update obstacles
      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const ob = obstaclesRef.current[i];
        ob.x -= ob.speed * dt;
        if (ob.x + ob.w < -80) obstaclesRef.current.splice(i, 1);
      }

      // Update bike physics
      vyRef.current -= GRAVITY * dt;
      yRef.current += vyRef.current * dt;
      if (yRef.current < 0) {
        yRef.current = 0;
        vyRef.current = 0;
      }

      // Update score
      if (scoreTimerRef.current > 120) {
        setScore((s) => s + 1);
        scoreTimerRef.current = 0;
      }

      // Collision detection - FIXED LOGIC
      if (!gameOver && started) {
        const bikeX = dimsRef.current.width * START_BIKE_LEFT_RATIO;
        
        // Bike collision box (slightly smaller than visual for better gameplay)
        const bikeCollisionMargin = isMobile ? 10 : 15;
        const bikeLeft = bikeX + bikeCollisionMargin;
        const bikeRight = bikeX + BIKE_DRAW_W - bikeCollisionMargin;
        const bikeBottom = GROUND_HEIGHT_PX + yRef.current + bikeCollisionMargin;
        const bikeTop = bikeBottom + BIKE_DRAW_H - (bikeCollisionMargin * 2);

        for (const ob of obstaclesRef.current) {
          // Obstacle collision box
          const obCollisionMargin = isMobile ? 5 : 8;
          const obLeft = ob.x + obCollisionMargin;
          const obRight = ob.x + ob.w - obCollisionMargin;
          const obBottom = GROUND_HEIGHT_PX + obCollisionMargin;
          const obTop = obBottom + ob.h - (obCollisionMargin * 2);

          // Check for collision with proper bounding boxes
          const horizontalCollision = bikeRight > obLeft && bikeLeft < obRight;
          const verticalCollision = bikeBottom < obTop && bikeTop > obBottom;
          
          // Only collide if bike is not clearly above the obstacle
          const collided = horizontalCollision && verticalCollision && bikeBottom < obTop - 5;

          if (collided) {
            setGameOver(true);
            runningRef.current = false;
            stopRunningSound();
            playCrashSound();
            break;
          }
        }
      }

      requestRef.current = requestAnimationFrame(step);
    }

    requestRef.current = requestAnimationFrame(step);
    return () => {
      mounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [started, gameOver, isMobile]);

  function renderObstacles() {
    return obstaclesRef.current.map((o) => {
      const style: React.CSSProperties = {
        position: "absolute",
        left: o.x,
        bottom: GROUND_HEIGHT_PX,
        width: o.w,
        height: o.h,
        transform: "translateZ(0)",
        pointerEvents: "none",
      };
      const src = o.type === "car" ? "/images/obstacle-car.png" : "/images/obstacle-bike.png";
      return <img key={o.id} src={src} alt={o.type} style={style} draggable={false} />;
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text" style={{ fontFamily: "var(--font-body)" }}>
      <Header />
      <NavBar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl">
          {!gameVisible && (
            <div className="flex flex-col items-center justify-center text-center gap-6 py-10">
              <h1 className="text-4xl md:text-5xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                404 — Page Not Found
              </h1>
              <p className="text-text-secondary max-w-lg">
                Oops — the page you requested does not exist. Click the bike to play a mini-game while you navigate back.
              </p>
              <div className="cursor-pointer select-none" onClick={beginGame} role="button" aria-label="Start bike game">
                <img src="/images/bike.gif" alt="bike" width={isMobile ? 120 : 260} height={isMobile ? 80 : 260} style={{ display: "block", margin: "0 auto" }} />
              </div>
            </div>
          )}

          {gameVisible && (
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-end mb-2">
                <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                  <div>Score: {score}</div>
                  <div className="text-xs text-text-secondary">High: {highScore}</div>
                </div>
              </div>

              <div ref={containerRef} className="relative w-full bg-transparent rounded-lg shadow-md overflow-hidden" style={{ height: GAME_HEIGHT_PX, maxWidth: 960 }} onClick={handleTapOrBikeClick}>
                <div className="absolute inset-0" aria-hidden>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(#e6f7ff,#c7f0ff 60%, #e6f7ff 100%)" }} />
                  <div className="absolute left-8 top-6 w-40 h-14 rounded-full opacity-30 blur-sm bg-white/80" />
                  <div className="absolute right-6 top-14 w-28 h-10 rounded-full opacity-20 blur-sm bg-white/80" />
                </div>

                <div className="absolute left-0 right-0" style={{ bottom: 0, height: GROUND_HEIGHT_PX, background: "repeating-linear-gradient(90deg, #2d2d2d 0px, #2d2d2d 8px, #242424 8px, #242424 18px)", boxShadow: "inset 0 6px 14px rgba(0,0,0,0.12)" }} />

                {renderObstacles()}

                <img src="/images/bike.gif" alt="player bike" draggable={false} style={{ position: "absolute", width: BIKE_DRAW_W, height: BIKE_DRAW_H, left: `calc(${START_BIKE_LEFT_RATIO * 100}%)`, bottom: GROUND_HEIGHT_PX + yRef.current, transform: "translateZ(0)", userSelect: "none", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); handleTapOrBikeClick(); }} />

                {gameOver && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-md p-6 text-center max-w-sm shadow-lg">
                      <h3 className="text-2xl font-semibold mb-2">Game Over</h3>
                      <p className="mb-2">Your score: <strong>{score}</strong></p>
                      <p className="mb-4 text-sm text-text-secondary">High score: <strong>{highScore}</strong></p>
                      <div className="flex gap-3 justify-center">
                        <button className="px-4 py-2 bg-brand text-white rounded-md" onClick={(e) => { e.stopPropagation(); resetGameState(); setStarted(true); runningRef.current = true; startRunningSound(); }}>Play again</button>
                        <button className="px-4 py-2 border rounded-md" onClick={(e) => { e.stopPropagation(); setGameVisible(false); setStarted(false); }}>Exit</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-text-secondary text-center">Tip: Press Space / ↑ to jump or tap the bike. Press P to pause/resume.</div>
            </div>
          )}
        </div>
      </main>

      <div className="h-8" />

      <style jsx global>{`
        :root {
          --background: #eef9ff;
          --surface: #cfeefe;
          --brand: #72ca45;
          --text: #0b1220;
          --text-secondary: rgba(11, 18, 32, 0.7);
          --font-heading: "Poppins", system-ui, sans-serif;
          --font-body: "Lato", system-ui, sans-serif;
        }
        .bg-background { background-color: var(--background); }
        .bg-surface { background-color: var(--surface); }
        .bg-brand { background-color: var(--brand); }
        .text-text { color: var(--text); }
        .text-text-secondary { color: var(--text-secondary); }
        img { -webkit-user-drag: none; user-drag: none; -webkit-touch-callout: none; }
      `}</style>
    </div>
  );
}