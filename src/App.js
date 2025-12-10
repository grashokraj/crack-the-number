import React, { useState, useCallback } from "react";
import GamePage from "./components/GamePage";
import "./App.css";
import Home from "./components/Home";
import NewGameModal  from "./components/NewGameModal";
import { ToastContainer, createToastManager } from "./components/ToastNotification";
/*
  App manages top-level UI state: showing modal, current player/mode/difficulty.
  Also manages toast notifications system.
  No CSS here — keep classNames from original HTML for easier styling.
*/

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState("Anonymous");
  const [gameMode, setGameMode] = useState("single"); // single | vsComputer | vsPlayer | online
  const [difficultyKey, setDifficultyKey] = useState("medium"); // easy | medium | hard
  const [startGameTrigger, setStartGameTrigger] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Toast manager for use throughout the app
  const toastManager = createToastManager((toast) => {
    setToasts((prev) => [...prev, toast]);
  });

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function openNewGameModal() {
    setShowModal(true);
  }

  function startGameFromModal({ name, mode, difficulty }) {
    setPlayerName(name || "Anonymous");
    setGameMode(mode || "single");
    setDifficultyKey(difficulty || "medium");
    setShowModal(false);
    // bump trigger so GamePage re-inits when new game started from modal
    setStartGameTrigger((s) => s + 1);
  }

  return (
    <div className="app-root">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="game-shell">
        <Home
          playerName={playerName}
          gameMode={gameMode}
          difficultyKey={difficultyKey}
          onNewGameClick={openNewGameModal}
        />
        <NewGameModal
          visible={showModal}
          initial={{ playerName, gameMode, difficultyKey }}
          onClose={() => setShowModal(false)}
          onStart={startGameFromModal}
        />
        <GamePage
          key={startGameTrigger} // re-mount GamePage each new game start
          playerName={playerName}
          gameMode={gameMode}
          difficultyKey={difficultyKey}
          toastManager={toastManager}
        />
      </div>
    </div>
  );
}
