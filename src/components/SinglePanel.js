import React, { useEffect, useRef, useState } from "react";
import HistoryPanel from "./HistoryPanel";
import { audioManager } from "../utils/AudioManager";

/*
  SinglePanel encapsulates single-player play area:
  - inputs for digits (array managed)
  - submit, clear, hint buttons
  - history of guesses
  - hint logic (as in original)
  - uses local storage for leaderboard
  - integrates audio and toast notifications
*/

export default function SinglePanel({ currentLength, setAttempts, onGameOver, playerName, difficultyKey, toastManager }) {
  const [inputs, setInputs] = useState(() => Array(5).fill("")); // always hold 5 inputs; display based on currentLength
  const [singleSecret, setSingleSecret] = useState([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [status, setStatus] = useState({ type: "info", text: "Good luck!" });
  const [history, setHistory] = useState([]);
  const [hintCount, setHintCount] = useState(0);
  const [hintedPositions, setHintedPositions] = useState(new Set());
  const [hintedDigitsWithoutPos, setHintedDigitsWithoutPos] = useState([]);

  const inputRefs = useRef([]);
  const timerStartRef = useRef(null); // used if want time of finishing
  const startTimeRef = useRef(null);

  // init / reset
  useEffect(() => {
    initSingleGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLength]);

  function generateSecret() {
    const digits = [1,2,3,4,5,6,7,8,9];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    return digits.slice(0, currentLength);
  }

  function initSingleGame() {
    setSingleSecret(generateSecret());
    setAttemptCount(0);
    setStatus({ type: "info", text: "Good luck!" });
    setHistory([]);
    setHintCount(0);
    setHintedPositions(new Set());
    setHintedDigitsWithoutPos([]);
    setInputs(Array(5).fill(""));
    setAttempts(0);
    startTimeRef.current = Date.now();
    // focus first visible input after mount
    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 0);
  }

  function computeFeedback(secretArr, guessArr) {
    let pos = 0, total = 0;
    for (let i = 0; i < secretArr.length; i++) {
      if (secretArr[i] === guessArr[i]) pos++;
    }
    const secCopy = [...secretArr];
    guessArr.forEach(g => {
      const idx = secCopy.indexOf(g);
      if (idx !== -1) { total++; secCopy[idx] = null; }
    });
    return { correctDigitsTotal: total, correctPositions: pos };
  }

  function readGuessFromInputs() {
    const active = inputs.slice(0, currentLength);
    if (active.some(v => v.trim() === "")) {
      return { error: `Please enter ${currentLength} digits.` };
    }
    const arr = active.map(n => parseInt(n, 10));
    if (arr.some(n => isNaN(n) || n < 1 || n > 9)) return { error: "Digits must be 1–9." };
    if (new Set(arr).size !== currentLength) return { error: "Digits cannot repeat." };
    return { digits: arr };
  }

  function handleInputChange(index, value) {
    const v = value.replace(/[^0-9]/g, "").slice(0, 1);
    const next = inputs.slice();
    next[index] = v;
    setInputs(next);
    if (v && index < currentLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !inputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const active = inputs.slice(0, currentLength);
      const filled = active.every(i => i && i.trim().length === 1);
      if (filled) handleSubmitGuess();
    }
  }

  function handleSubmitGuess() {
    const res = readGuessFromInputs();
    if (res.error) {
      setStatus({ type: "warning", text: res.error });
      audioManager.play('error');
      return;
    }
    audioManager.play('click');
    const guess = res.digits;
    const fb = computeFeedback(singleSecret, guess);
    const newAttempt = attemptCount + 1;
    setAttemptCount(newAttempt);
    setAttempts(newAttempt);
    setHistory((h) => [{ guess, total: fb.correctDigitsTotal, pos: fb.correctPositions, attempt: newAttempt }, ...h]);
    if (fb.correctPositions === currentLength) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setStatus({ type: "success", text: `You cracked it in ${newAttempt} attempts and ${elapsed}s.` });
      if (toastManager) {
        toastManager.showToast(`🎉 Solved in ${newAttempt} attempts!`, 'success');
      }
      onGameOver(elapsed, newAttempt);
      // save to leaderboard
      saveToLeaderboard(newAttempt, elapsed);
    } else {
      setStatus({ type: "info", text: `${fb.correctDigitsTotal} correct, ${fb.correctPositions} in place.` });
      if (toastManager && fb.correctPositions > 0) {
        toastManager.showToast(`${fb.correctPositions} digit${fb.correctPositions > 1 ? 's' : ''} in correct position!`, 'info');
      }
    }
    // clear inputs and focus first
    const nextInputs = inputs.slice();
    for (let i = 0; i < currentLength; i++) nextInputs[i] = "";
    setInputs(nextInputs);
    inputRefs.current[0]?.focus();
  }

  function saveToLeaderboard(attemptsCount, elapsed) {
    const key = `ctn_scores_${difficultyKey}`;
    const str = localStorage.getItem(key);
    let list = [];
    try { list = JSON.parse(str) || []; } catch (e) { list = []; }
    list.push({ name: playerName || "Anonymous", attempts: attemptsCount, time: elapsed });
    // sort by attempts then time
    list.sort((a,b) => (a.attempts - b.attempts) || (a.time - b.time));
    // keep top 10 perhaps
    localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
  }

  // Hint logic (replicated from original)
  function updateHintAvailability() {
    // controlled outside for enabling/disabling UI; function kept for parity
    // we simply compute whether hint button should be enabled
    if (attemptCount >= 15) return true;
    if (attemptCount >= 10) return hintCount < 2;
    if (attemptCount >= 6) return hintCount < 1;
    return false;
  }

  function revealDigitWithPosition(preferDigitOnlyHint) {
    // try to reveal a position that is not yet hinted
    let indexToReveal = -1;
    if (preferDigitOnlyHint && hintedDigitsWithoutPos.length > 0) {
      const hintedDigit = hintedDigitsWithoutPos[0];
      indexToReveal = singleSecret.indexOf(hintedDigit);
      if (indexToReveal !== -1 && hintedPositions.has(indexToReveal)) {
        indexToReveal = -1;
      }
    }
    if (indexToReveal === -1) {
      const availableIndices = [];
      for (let i = 0; i < singleSecret.length; i++) {
        if (!hintedPositions.has(i)) availableIndices.push(i);
      }
      if (availableIndices.length === 0) return false;
      indexToReveal = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    const newHintedPositions = new Set(hintedPositions);
    newHintedPositions.add(indexToReveal);
    setHintedPositions(newHintedPositions);

    const nextInputs = inputs.slice();
    nextInputs[indexToReveal] = String(singleSecret[indexToReveal]);
    setInputs(nextInputs);

    return true;
  }

  function useHint() {
    if (attemptCount < 6) return; // not eligible
    if (attemptCount >= 6 && hintCount === 0) {
      // reveal a digit (without position)
      const availableDigits = singleSecret.filter(d => !hintedDigitsWithoutPos.includes(d));
      if (availableDigits.length === 0) {
        setStatus({ type: "info", text: "All digits already hinted." });
        return;
      }
      const digit = availableDigits[Math.floor(Math.random() * availableDigits.length)];
      setHintedDigitsWithoutPos([...hintedDigitsWithoutPos, digit]);
      setHintCount(1);
      audioManager.play('click');
      setStatus({ type: "info", text: `💡 Hint: one of the digits is ${digit}.` });
      if (toastManager) {
        toastManager.showToast(`One digit is ${digit}`, 'info');
      }
      return;
    }
    if (attemptCount >= 10 && hintCount >= 1) {
      const preferDigitOnly = hintCount === 1;
      const revealed = revealDigitWithPosition(preferDigitOnly);
      if (revealed) {
        audioManager.play('click');
        setHintCount((c) => c + 1);
        setStatus({ type: "info", text: "💡 Position hint revealed." });
        if (toastManager) {
          toastManager.showToast('Position hint revealed', 'info');
        }
      } else {
        setStatus({ type: "info", text: "All positions already revealed by hints." });
      }
    }
  }

  function handleClear() {
    setInputs(Array(5).fill(""));
    setStatus({ type: "info", text: "Cleared." });
    audioManager.play('click');
    inputRefs.current[0]?.focus();
  }

  return (
    <>
      <section className="panel" id="singlePanel">
        <div className="panel-title"><span>Current Guess</span></div>

        <div className="guess-row">
          {Array.from({ length: 5 }).map((_, idx) => (
            <input
              key={idx}
              type="tel"
              maxLength="1"
              className="digit-input"
              style={{ display: idx < currentLength ? "" : "none" }}
              value={inputs[idx]}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              ref={(el) => (inputRefs.current[idx] = el)}
            />
          ))}
        </div>

        <div className="button-row">
          <button className="btn btn-primary" id="btnGuess" onClick={handleSubmitGuess}>Submit</button>
          <button className="btn btn-secondary" id="btnClear" onClick={handleClear}>Clear</button>
          <button className="btn btn-hint" id="btnHint" disabled={!updateHintAvailability()} onClick={useHint}>Hint</button>
        </div>

        <div className={`message-bar ${status.type === "info" ? "message-info" : status.type === "warning" ? "message-warning" : "message-success"}`} id="statusBar" style={{ display: "flex" }}>
          <span id="statusLabel">{status.text}</span>
          <span id="hintLabel" style={{ marginLeft: 6 }}></span>
        </div>
      </section>

      <HistoryPanel history={history} onNewGame={() => initSingleGame()} />
    </>
  );
}
