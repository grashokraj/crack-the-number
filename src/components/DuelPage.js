import React, { useEffect, useRef, useState } from "react";
import DuelPanels from "./DuelPanels";
import HistoryPanel from "./HistoryPanel";
import HelperPanel from "./HelperPanel";
import { QUICKEST_KEY } from "../utils/config";
import { audioManager } from "../utils/AudioManager";

/*
  DuelPage - Dedicated page for vs Computer duel mode
  Contains the duel game logic, history, and helper panel
*/

export default function DuelPage({ playerName, difficultyKey, onBackToHome }) {
  const [attempts, setAttempts] = useState(0);
  const [timeLabel, setTimeLabel] = useState("Time: 0:00");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  function startTimer() {
    stopTimer();
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setTimeLabel("Time: 0:00");
    timerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const m = Math.floor(sec / 60),
        s = sec % 60;
      setElapsedSeconds(sec);
      setTimeLabel(`Time: ${m}:${s < 10 ? "0" + s : s}`);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function onGameOver(elapsed, attemptsCount) {
    // Play success sound
    audioManager.play('success');

    // Update quickest finish storage
    const metric = attemptsCount * 1000 + elapsed;
    const summary = `${attemptsCount} tries in ${elapsed}s`;
    const prevStr = localStorage.getItem(QUICKEST_KEY);
    let better = false;
    if (!prevStr) better = true;
    else {
      try {
        const prev = JSON.parse(prevStr);
        if (metric < (prev.metric || 999999)) better = true;
      } catch (e) {
        better = true;
      }
    }
    if (better) {
      localStorage.setItem(QUICKEST_KEY, JSON.stringify({ metric, summary }));
    }
    stopTimer();
  }

  const currentLength = difficultyKey === "easy" ? 3 : difficultyKey === "hard" ? 5 : 4;

  return (
    <div id="duelPage" className="game-page">
      <header className="game-header">
        <div className="game-title">Crack The Number</div>
        <button className="btn-main new-game-btn" onClick={onBackToHome}>New Game</button>
        <div className="player-info" id="playerInfo">
          {playerName} | Mode: vs Computer
        </div>
        <div className="game-meta">
          <span className="pill" id="attemptsLabel">Attempts: {attempts}</span>
          <span className="pill" id="difficultyLabel">
            {difficultyKey === "easy" ? "Level: Easy" : difficultyKey === "hard" ? "Level: Hard" : "Level: Medium"}
          </span>
          <span className="pill timer-pill" id="timerLabel">{timeLabel}</span>
        </div>
      </header>

      <DuelPanels
        currentLength={currentLength}
        onGameOver={onGameOver}
        setAttempts={setAttempts}
        toastManager={null} // Will be passed from parent if needed
      />

      <HistoryPanel />
      <HelperPanel />
    </div>
  );
}