import React from "react";

/*
  Displays guess history entries; clicking digits will toggle classes is left as simple callbacks
  (we won't manipulate DOM classes in React, so expose an onDigitClick hook if needed).
*/

export default function HistoryPanel({ history = [], onNewGame }) {
  return (
    <section className="panel" id="singleHistoryPanel">
      <div className="panel-title">
        <span>Guess History</span>
        <button className="btn btn-ghost" style={{ flex: "0 0 auto", fontSize: "0.7rem", padding: "4px 10px" }} id="btnNewSingleGame" onClick={onNewGame}>
          New Game
        </button>
      </div>
      <div className="history-panel" id="historyContainer">
        {history.length === 0 ? (
          <div style={{ opacity: 0.7, fontStyle: "italic" }}>No guesses yet.</div>
        ) : (
          history.map((h) => (
            <div key={h.attempt} className="history-item">
              <div className="history-left">
                <span>#{h.attempt}</span>
                <span className="history-guess" style={{ marginLeft: 8 }}>
                  {h.guess.map((d, i) => (
                    <span key={i} className="history-digit" style={{ padding: "1px 3px", borderRadius: 4 }}>{d}</span>
                  ))}
                </span>
              </div>
              <div>{h.total} C - {h.pos} P</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
