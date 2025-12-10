import React, { useEffect, useRef, useState } from "react";
import SinglePanel from "./SinglePanel";
import DuelPanels from "./DuelPanels";
import HistoryPanel from "./HistoryPanel";
import Leaderboard from "./Leaderboard";
import HelperPanel from "./HelperPanel";
import OnlineSetupModal from "./OnlineSetupModal";
import { NetworkManager } from "../utils/NetworkManager";
import { GAME_STATE_KEY, QUICKEST_KEY } from "../utils/config";
import { audioManager } from "../utils/AudioManager";

/*
  GamePage decides whether to show single-player UI or duel vs computer UI.
  It manages timer label, attempts label, difficulty label and player info text.
  Also handles state persistence and online mode initialization.
*/

export default function GamePage({ playerName, gameMode, difficultyKey, toastManager }) {
  const [showGame] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [timeLabel, setTimeLabel] = useState("Time: 0:00");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentLength, setCurrentLength] = useState(4);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [networkMgr, setNetworkMgr] = useState(null);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const networkMgrRef = useRef(null);

  // Initialize online mode if needed
  useEffect(() => {
    if (gameMode === "online") {
      setShowOnlineModal(true);
      if (!networkMgrRef.current) {
        const mgr = new NetworkManager();
        networkMgrRef.current = mgr;
        setNetworkMgr(mgr);
        
        // Register network message handlers
        if (!window.__networkHandlers) {
          window.__networkHandlers = {};
        }
      }
    }
  }, [gameMode]);

  useEffect(() => {
    // set digit length from difficulty
    if (difficultyKey === "easy") setCurrentLength(3);
    else if (difficultyKey === "hard") setCurrentLength(5);
    else setCurrentLength(4);
  }, [difficultyKey]);

  useEffect(() => {
    startTimer();
    // Restore state if available
    restoreGameState();
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

  function saveGameState() {
    const state = {
      playerName,
      gameMode,
      difficultyKey,
      attempts,
      elapsedSeconds,
      timestamp: Date.now(),
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  }

  function restoreGameState() {
    try {
      const str = localStorage.getItem(GAME_STATE_KEY);
      if (str) {
        const state = JSON.parse(str);
        // You can use this to restore partial state if needed
        if (state.attempts) setAttempts(state.attempts);
      }
    } catch (e) {
      console.error("Failed to restore game state:", e);
    }
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
      if (toastManager) {
        toastManager.showToast(`🏆 New Record! ${summary}`, 'success');
      }
    }
    stopTimer();
    // Save final state
    saveGameState();
  }

  const handleOnlineConnected = () => {
    setShowOnlineModal(false);
    if (toastManager) {
      toastManager.showToast('Connected! Game starting...', 'success');
    }
  };

  return (
    <div id="gamePage" style={{ display: showGame ? "block" : "none" }}>
      <OnlineSetupModal
        isVisible={showOnlineModal}
        networkMgr={networkMgr}
        onConnected={handleOnlineConnected}
        onClose={() => setShowOnlineModal(false)}
      />

      <header className="game-header">
        <div className="game-title">Crack The Number</div>
        <div className="player-info" id="playerInfo">
          {playerName} | Mode: {gameMode === "single" ? "Single Player" : gameMode === "vsComputer" ? "vs Computer" : "Online"}
        </div>
        <div className="game-meta">
          <span className="pill" id="attemptsLabel">Attempts: {attempts}</span>
          <span className="pill" id="difficultyLabel">
            {difficultyKey === "easy" ? "Level: Easy" : difficultyKey === "hard" ? "Level: Hard" : "Level: Medium"}
          </span>
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
            toastManager={toastManager}
          />
          <HistoryPanel />
          <Leaderboard difficultyKey={difficultyKey} />
        </>
      ) : gameMode === "vsComputer" ? (
        <>
          <DuelPanels
            currentLength={currentLength}
            onGameOver={onGameOver}
            setAttempts={setAttempts}
            toastManager={toastManager}
          />
        </>
      ) : (
        <div className="panel">
          <div className="panel-title">Online Game</div>
          <p>Waiting for opponent connection...</p>
        </div>
      )}

      <HelperPanel />
    </div>
  );
}
