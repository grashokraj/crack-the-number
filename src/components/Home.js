import React, { useEffect, useState } from "react";

/*
  Simple home component that shows title, subtitle and quickest finish label,
  and a New Game button which notifies parent via onNewGameClick.
*/

export default function Home({ playerName, gameMode, difficultyKey, onNewGameClick }) {
  const [quickest, setQuickest] = useState("—");

  useEffect(() => {
    const key = "ctn_quickest_overall";
    const str = localStorage.getItem(key);
    if (str) {
      try {
        const parsed = JSON.parse(str);
        setQuickest(parsed.summary || "—");
      } catch (e) {
        setQuickest("—");
      }
    } else {
      setQuickest("—");
    }
  }, []);

  return (
    <div id="homePage" className="home-page">
      <div className="home-title">Crack The Number</div>
      <div className="home-subtitle">Guess the secret number (1–9, no repeats)</div>
      <div className="quickest-finish" id="quickestFinishLabel">Quickest Finish: {quickest}</div>
      <button className="btn-main" id="btnNewGameHome" onClick={onNewGameClick}>New Game</button>
    </div>
  );
}
