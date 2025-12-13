import React, { useState } from "react";

/*
  Displays guess history entries with clickable digits for crossing out,
  and color-coded feedback based on correctness.
*/

export default function HistoryPanel({ history = [], onNewGame }) {
  const [crossedDigits, setCrossedDigits] = useState(new Set());
  const [greenDigits, setGreenDigits] = useState(new Set());

  const handleDigitClick = (attempt, digitIndex, digit) => {
    const key = `${attempt}-${digitIndex}-${digit}`;
    const newCrossed = new Set(crossedDigits);
    if (newCrossed.has(key)) {
      newCrossed.delete(key);
    } else {
      newCrossed.add(key);
    }
    setCrossedDigits(newCrossed);
  };

  const handleDigitDoubleClick = (attempt, digitIndex, digit) => {
    const key = `${attempt}-${digitIndex}-${digit}`;
    const newGreen = new Set(greenDigits);
    if (newGreen.has(key)) {
      newGreen.delete(key);
    } else {
      newGreen.add(key);
    }
    setGreenDigits(newGreen);
  };

  const getFeedbackColor = (total, pos, maxLength) => {
    if (pos === maxLength) return "#42f59b"; // success green
    if (pos > 0 || total > 0) return "#ffaa00"; // warning orange
    return "#a5a6b5"; // muted gray
  };

  return (
    <section className="panel" id="singleHistoryPanel">
      <div className="panel-title">
        <span>Guess History</span>
        {onNewGame && typeof onNewGame === 'function' && (
          <button className="btn btn-ghost" style={{ flex: "0 0 auto", fontSize: "0.7rem", padding: "4px 10px" }} id="btnNewSingleGame" onClick={onNewGame}>
            New Game
          </button>
        )}
      </div>
      <div className="history-panel" id="historyContainer">
        {history.length === 0 ? (
          <div style={{ opacity: 0.7, fontStyle: "italic" }}>No guesses yet.</div>
        ) : (
          history.map((h) => (
            <div key={h.attempt} className="history-item">
              <div className="history-left">
                <span style={{ color: "#a5a6b5", fontSize: "0.75rem" }}>#{h.attempt}</span>
                <span className="history-guess" style={{ marginLeft: 8 }}>
                  {h.guess.map((d, i) => {
                    const key = `${h.attempt}-${i}-${d}`;
                    const isCrossed = crossedDigits.has(key);
                    const isGreen = greenDigits.has(key);
                    return (
                      <span
                        key={i}
                        className={`history-digit ${isCrossed ? 'crossed' : ''}`}
                        style={{
                          padding: "1px 3px",
                          borderRadius: 4,
                          cursor: "pointer",
                          textDecoration: isCrossed ? "line-through" : "none",
                          opacity: isCrossed ? 0.5 : 1,
                          backgroundColor: isGreen ? "#42f59b" : "transparent",
                          color: isGreen ? "#020308" : "inherit"
                        }}
                        onClick={() => handleDigitClick(h.attempt, i, d)}
                        onDoubleClick={() => handleDigitDoubleClick(h.attempt, i, d)}
                        title="Click to cross out, double-click to highlight green"
                      >
                        {d}
                      </span>
                    );
                  })}
                </span>
              </div>
              <div style={{
                fontWeight: "600",
                color: getFeedbackColor(h.total, h.pos, h.guess.length)
              }}>
                <span style={{ marginRight: 8 }}>{h.total}✅</span>
                <span>{h.pos}📍</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
