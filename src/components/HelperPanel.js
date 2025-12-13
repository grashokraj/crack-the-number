import React from "react";

/*
  HelperPanel Component - Displays game rules and hint information
  Shown during gameplay as a reference guide
*/

export default function HelperPanel() {
  return (
    <section className="panel helper-panel">
      <div className="panel-title">How It Works</div>
      <ul>
        <li>
          <strong>C</strong> = Correct digit (in the number, wrong position)
        </li>
        <li>
          <strong>P</strong> = Correct Position (right digit, right spot)
        </li>
        <li>
          <strong>Hints</strong> available after 6, 10, and 15 attempts
        </li>
        <li>Numbers 1–9 with no repeats</li>
        <li>Fastest time wins the leaderboard</li>
      </ul>
    </section>
  );
}
