import React, { useEffect, useRef, useState } from "react";
import SinglePanel from "./SinglePanel";
import DuelPanels from "./DuelPanels";
import Leaderboard from "./Leaderboard";

/*
  GamePage decides whether to show single-player UI or duel vs computer UI.
  It manages timer label, attempts label, difficulty label and player info text.
*/

export default function GamePage({ playerName, gameMode, difficultyKey }) {
  const [showGame, setShowGame] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [timeLabel, setTimeLabel] = useState("Time: 0:00");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentLength, setCurrentLength] = useState(4);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // set digit length from difficulty
    if (difficultyKey === "easy") setCurrentLength(3);
    else if (difficultyKey === "hard") setCurrentLength(5);
    else setCurrentLength(4);
  }, [difficultyKey]);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // update quickest finish storage
    const metric = attemptsCount * 1000 + elapsed;
    const summary = `Quickest Finish: ${attemptsCount} tries in ${elapsed}s (Mode: ${gameMode}, Difficulty: ${difficultyKey})`;
    const key = "ctn_quickest_overall";
    const prevStr = localStorage.getItem(key);
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
      localStorage.setItem(key, JSON.stringify({ metric, summary }));
    }
    stopTimer();
  }

  return (
    <div id="gamePage" style={{ display: showGame ? "block" : "none" }}>
      <header className="game-header">

        <div className="player-info" id="playerInfo">{playerName} | Mode: {gameMode === "single" ? "Single Player" : (gameMode === "vsComputer")}</div>
        <div className="game-meta">
          <span className="pill" id="attemptsLabel">Attempts: {attempts}</span>
          <span className="pill" id="difficultyLabel">Difficulty: {difficultyKey === "easy" ? "Easy (3 digits)" : difficultyKey === "hard" ? "Hard (5 digits)" : "Medium (4 digits)"}</span>
          <span className="pill timer-pill" id="timerLabel">{timeLabel}</span>
        </div>
      </header>

      {gameMode === "single" || gameMode === "vsPlayer" ? (
        <>
          <SinglePanel
            currentLength={currentLength}
            setAttempts={setAttempts}
            onGameOver={onGameOver}
            playerName={playerName}
            difficultyKey={difficultyKey}
          />
          <Leaderboard difficultyKey={difficultyKey} />
        </>
      ) : (
        <DuelPanels
          currentLength={currentLength}
          onGameOver={onGameOver}
        />
      )}
    </div>
  );
}
