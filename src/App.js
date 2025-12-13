import React, { useState, useCallback } from "react";
import "./App.css";
import Home from "./components/Home";
import NewGameModal from "./components/NewGameModal";
import SinglePlayerPage from "./components/SinglePlayerPage";
import DuelPage from "./components/DuelPage";
import { ToastContainer, createToastManager } from "./components/ToastNotification";
/*
  App manages top-level UI state and page navigation.
  Supports multiple pages: home, single-player, duel
  Also manages toast notifications system.
*/

export default function App() {
  const [currentPage, setCurrentPage] = useState("home"); // home | single | duel
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState("Anonymous");
  const [gameMode, setGameMode] = useState("single"); // single | vsComputer | vsPlayer | online
  const [difficultyKey, setDifficultyKey] = useState("medium"); // easy | medium | hard
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

  function backToHome() {
    setCurrentPage("home");
  }

  function startGameFromModal({ name, mode, difficulty }) {
    setPlayerName(name || "Anonymous");
    setGameMode(mode || "single");
    setDifficultyKey(difficulty || "medium");
    setShowModal(false);

    // Navigate to appropriate page based on game mode
    if (mode === "single" || mode === "vsPlayer") {
      setCurrentPage("single");
    } else if (mode === "vsComputer") {
      setCurrentPage("duel");
    } else {
      // For online or other modes, could add more pages later
      setCurrentPage("single"); // fallback
    }
  }

  function renderCurrentPage() {
    switch (currentPage) {
      case "single":
        return (
          <SinglePlayerPage
            playerName={playerName}
            difficultyKey={difficultyKey}
            onBackToHome={backToHome}
          />
        );
      case "duel":
        return (
          <DuelPage
            playerName={playerName}
            difficultyKey={difficultyKey}
            onBackToHome={backToHome}
          />
        );
      default:
        return (
          <Home
            playerName={playerName}
            gameMode={gameMode}
            difficultyKey={difficultyKey}
            onNewGameClick={openNewGameModal}
          />
        );
    }
  }

  return (
    <div className="app-root">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="game-shell">
        {renderCurrentPage()}
        <NewGameModal
          visible={showModal}
          initial={{ playerName, gameMode, difficultyKey }}
          onClose={() => setShowModal(false)}
          onStart={startGameFromModal}
        />
      </div>
    </div>
  );
}
