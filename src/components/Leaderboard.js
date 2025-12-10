import React, { useEffect, useState } from "react";

/*
  Loads leaderboard from localStorage for given difficultyKey.
*/

export default function Leaderboard({ difficultyKey }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficultyKey]);

  function loadLeaderboard() {
    const key = "ctn_scores_" + (difficultyKey || "medium");
    const str = localStorage.getItem(key);
    if (!str) {
      setScores([]);
      return;
    }
    try {
      const list = JSON.parse(str) || [];
      setScores(list);
    } catch (e) {
      setScores([]);
    }
  }

  return (
    <section className="leaderboard-panel" id="leaderboardPanel">
      <div className="leaderboard-header">
        <strong>High Scores</strong>
        <small id="leaderboardDifficultyLabel">({difficultyKey === "easy" ? "Easy" : difficultyKey === "hard" ? "Hard" : "Medium"})</small>
      </div>
      <ul className="leaderboard-list" id="leaderboardList">
        {scores.length === 0 ? (
          <li className="leaderboard-empty">No scores yet. Be the first!</li>
        ) : (
          scores.map((s, idx) => (
            <li key={idx}>
              <span>{idx + 1}. {s.name || "Anonymous"} — {s.attempts} tries</span>
              <span>{s.time}s</span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
