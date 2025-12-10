import React, { useEffect, useState } from "react";

/*
  Controlled modal for starting a new game.
  Calls onStart({name, mode, difficulty}) when user clicks Start Game.
  No CSS included — the original overlay classes remain.
*/

export default function NewGameModal({ visible, initial, onClose, onStart }) {
  const [playerName, setPlayerName] = useState('');
  const [mode, setMode] = useState(initial.gameMode || "single");
  const [difficulty, setDifficulty] = useState(
    initial.difficultyKey || "medium"
  );

  useEffect(() => {
    setPlayerName("Player1");
    setMode(initial.gameMode || "single");
    setDifficulty(initial.difficultyKey || "medium");
  }, [initial]);

  function handleStart() {
    onStart({ name: playerName.trim() || "Player1", mode, difficulty });
  }

  if (!visible) return null;

  return (
    <div className={`modal-overlay show`} id="modalOverlay">
      <div className="modal-content">
        <div className="modal-title">New Game Setup</div>

        <div className="form-group">
          <label className="form-label">Player Name (optional)</label>
          <input
            className="form-input"
            type="text"
            id="playerNameInput"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Game Mode</label>
          <div className="mode-buttons">
            <button
              className={`btn-option ${mode === "single" ? "selected" : ""}`}
              data-mode="single"
              onClick={() => setMode("single")}
            >
              Single Player
            </button>
            <button
              className={`btn-option ${
                mode === "vsComputer" ? "selected" : ""
              }`}
              data-mode="vsComputer"
              onClick={() => setMode("vsComputer")}
            >
              vs Computer
            </button>
            <button
              className={`btn-option ${
                mode === "online" ? "selected" : ""
              }`}
              data-mode="online"
              onClick={() => setMode("online")}
            >
              Online
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Difficulty</label>
          <div className="difficulty-buttons">
            <button
              className={`btn-option ${
                difficulty === "easy" ? "selected" : ""
              }`}
              data-difficulty="easy"
              onClick={() => setDifficulty("easy")}
            >
              Easy (3)
            </button>
            <button
              className={`btn-option ${
                difficulty === "medium" ? "selected" : ""
              }`}
              data-difficulty="medium"
              onClick={() => setDifficulty("medium")}
            >
              Medium (4)
            </button>
            <button
              className={`btn-option ${
                difficulty === "hard" ? "selected" : ""
              }`}
              data-difficulty="hard"
              onClick={() => setDifficulty("hard")}
            >
              Hard (5)
            </button>
          </div>
        </div>

        <div className="btn-start-cancel-cont">
          <button
            className="btn-modal-primary"
            id="btnStartGame"
            onClick={handleStart}
          >
            Start Game
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
