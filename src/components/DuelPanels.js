import React, { useEffect, useRef, useState } from "react";
import SecretPad from "./SecretPad";

/*
  DuelPanels implements the vsComputer mode:
  - user guesses computer's secret
  - computer proposes guesses and user gives feedback (total correct, correct pos)
  - uses candidate list elimination as original
*/

function generateCandidatesForLength(len) {
  const candidates = [];
  const digits = [1,2,3,4,5,6,7,8,9];

  function backtrack(path) {
    if (path.length === len) {
      candidates.push([...path]);
      return;
    }
    for (let d of digits) {
      if (path.includes(d)) continue;
      path.push(d);
      backtrack(path);
      path.pop();
    }
  }
  backtrack([]);
  return candidates;
}

export default function DuelPanels({ currentLength, onGameOver }) {
  const [computerSecret, setComputerSecret] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [duelRound, setDuelRound] = useState(0);
  const [userHistory, setUserHistory] = useState([]);
  const [computerHistory, setComputerHistory] = useState([]);
  const [currentComputerGuess, setCurrentComputerGuess] = useState(null);
  const [computerFeedbackPending, setComputerFeedbackPending] = useState(false);
  const totalRef = useRef("");
  const posRef = useRef("");

  useEffect(() => {
    initDuelGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLength]);

  function generateSecret() {
    const all = [1,2,3,4,5,6,7,8,9];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, currentLength);
  }

  function initDuelGame() {
    setDuelRound(0);
    setComputerSecret(generateSecret());
    setCandidates(generateCandidatesForLength(currentLength));
    setUserHistory([]);
    setComputerHistory([]);
    setCurrentComputerGuess(null);
    setComputerFeedbackPending(false);
  }

  function computeFeedback(secretArr, guessArr) {
    let pos = 0, total = 0;
    for (let i = 0; i < secretArr.length; i++) {
      if (secretArr[i] === guessArr[i]) pos++;
    }
    const copy = [...secretArr];
    guessArr.forEach(g => {
      const idx = copy.indexOf(g);
      if (idx !== -1) { total++; copy[idx] = null; }
    });
    return { total, pos };
  }

  function handleUserGuess(guessArr) {
    const fb = computeFeedback(computerSecret, guessArr);
    setUserHistory(h => [{ guess: guessArr, total: fb.total, pos: fb.pos, round: duelRound + 1 }, ...h]);
    if (fb.pos === currentLength) {
      // user cracked the computer
      onGameOver(0, duelRound + 1);
      return;
    }
    proposeComputerGuess();
  }

  function proposeComputerGuess() {
    if (candidates.length === 0) {
      // inconsistent
      return;
    }
    const guess = candidates[0];
    setCurrentComputerGuess(guess);
    setComputerFeedbackPending(true);
  }

  function compareGuess(code, guess) {
    // returns A = correct positions, B = correct digits but wrong position
    const fb = computeFeedback(code, guess);
    return { A: fb.pos, B: fb.total - fb.pos };
  }

  function confirmComputerFeedback() {
    const total = parseInt(totalRef.current.value || "", 10);
    const pos = parseInt(posRef.current.value || "", 10);
    if (isNaN(total) || isNaN(pos) || total < 0 || pos < 0 || pos > total || total > currentLength) {
      alert("Please enter valid feedback.");
      return;
    }
    setComputerHistory(h => [{ guess: currentComputerGuess, total, pos, round: duelRound + 1 }, ...h]);
    const A = pos, B = total - pos;
    const filtered = candidates.filter(code => {
      const fb = compareGuess(code, currentComputerGuess);
      return fb.A === A && fb.B === B;
    });
    setCandidates(filtered);

    if (total === currentLength && pos === currentLength) {
      // computer cracked user's secret
      onGameOver(0, duelRound + 1);
    } else if (filtered.length === 0) {
      // inconsistent feedback
      // show message or stop
    } else {
      setDuelRound(r => r + 1);
      setCurrentComputerGuess(null);
      setComputerFeedbackPending(false);
    }
  }

  return (
    <div className="duel-panels" id="duelPanels" style={{ display: "block" }}>
      <div className="duel-panel">
        <div className="duel-panel-title">You Guess Computer 🎮</div>
        <UserGuessRow onSubmit={(digits) => handleUserGuess(digits)} currentLength={currentLength} />
        <div className="message-bar message-info" id="duelUserStatusBar" style={{ display: "none" }}>
          <span id="duelUserStatusLabel"></span>
        </div>
        <div className="duel-history" id="duelUserHistory">
          {userHistory.map((h, idx) => (
            <div key={idx} style={{ marginBottom: 6 }}>{`#${h.round} — ${h.guess.join("")} — ${h.total} C, ${h.pos} P`}</div>
          ))}
        </div>
      </div>

      <SecretPad />

      <div className="duel-panel">
        <div className="duel-panel-title">Computer Guesses You 🧠</div>
        <div className="duel-round-label" id="duelRoundLabel">Round: {duelRound + 1}</div>
        <div className="duel-history" id="duelComputerHistory">
          {computerHistory.map((h, idx) => (
            <div key={idx} style={{ marginBottom: 6 }}>{`#${h.round} — ${h.guess.join("")} — ${h.total} C, ${h.pos} P`}</div>
          ))}
        </div>

        {currentComputerGuess && (
          <div id="duelComputerCurrentGuess" style={{ marginTop: 8 }}>
            <div style={{ fontSize: "0.8rem", color: "#e7e8ff", marginBottom: 4, fontWeight: 600 }}>Current Computer Guess:</div>
            <div className="duel-computer-guess-row">
              <div className="duel-computer-digits" id="duelComputerDigitsDisplay">
                {currentComputerGuess.map((d, i) => <span key={i} className="history-digit" style={{ marginRight: 4 }}>{d}</span>)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.65rem" }}>Total Digits</label>
                <input type="number" id="duelUserTotalCorrect" min="0" max={currentLength} style={{ width: 40, padding: 3 }} ref={el => (totalRef.current = el)} />
                <label style={{ fontSize: "0.65rem" }}>Correct Pos</label>
                <input type="number" id="duelUserCorrectPos" min="0" max={currentLength} style={{ width: 40, padding: 3 }} ref={el => (posRef.current = el)} />
              </div>
              <button className="btn btn-secondary" id="btnDuelConfirmFeedback" style={{ flex: "0 0 auto" }} onClick={confirmComputerFeedback}>Confirm</button>
            </div>
          </div>
        )}

        <div className="message-bar message-info" id="duelStatusBar" style={{ display: "none", marginTop: 8 }}>
          <span id="duelStatusLabel"></span>
        </div>
      </div>
    </div>
  );
}

/* helper small component for user guess input row inside DuelPanels */
function UserGuessRow({ currentLength, onSubmit }) {
  const [inputs, setInputs] = useState(Array(5).fill(""));
  const refs = useRef([]);

  useEffect(() => {
    setInputs(Array(5).fill(""));
    setTimeout(() => { refs.current[0]?.focus(); }, 0);
  }, [currentLength]);

  function change(i, val) {
    const v = val.replace(/[^0-9]/g, "").slice(0,1);
    const next = inputs.slice();
    next[i] = v;
    setInputs(next);
    if (v && i < currentLength - 1) {
      refs.current[i+1]?.focus();
    }
  }

  function submit() {
    const active = inputs.slice(0, currentLength);
    if (active.some(a => a === "")) {
      alert(`Please enter ${currentLength} digits.`);
      return;
    }
    const arr = active.map(n => parseInt(n, 10));
    if (arr.some(n => isNaN(n) || n < 1 || n > 9)) {
      alert("Digits must be 1-9.");
      return;
    }
    if (new Set(arr).size !== currentLength) {
      alert("Digits cannot repeat.");
      return;
    }
    onSubmit(arr);
    setInputs(Array(5).fill(""));
    refs.current[0]?.focus();
  }

  return (
    <>
      <div className="guess-row">
        {Array.from({ length: 5 }).map((_, idx) => (
          <input
            key={idx}
            type="tel"
            maxLength={1}
            className="digit-input"
            style={{ display: idx < currentLength ? "" : "none" }}
            value={inputs[idx]}
            onChange={(e) => change(idx, e.target.value)}
            ref={el => refs.current[idx] = el}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Backspace" && !inputs[idx] && idx > 0) refs.current[idx-1]?.focus(); }}
          />
        ))}
      </div>
      <div className="button-row">
        <button className="btn btn-primary" onClick={submit}>Submit Guess</button>
        <button className="btn btn-secondary" onClick={() => { setInputs(Array(5).fill("")); refs.current[0]?.focus(); }}>Clear</button>
      </div>
    </>
  );
}
