import React, { useState, useEffect } from "react";

/*
  OnlineSetupModal Component
  Handles online game setup with host/join flow
  Integrates with NetworkManager for peer connections
*/

export default function OnlineSetupModal({
  isVisible,
  networkMgr,
  onConnected,
  onClose,
}) {
  const [menuState, setMenuState] = useState("main"); // main, host, join
  const [hostCode, setHostCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinStatus, setJoinStatus] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isVisible && networkMgr) {
      // Generate host code when modal opens and host is selected
      if (menuState === "host") {
        const code = networkMgr.generateId();
        setHostCode(code);
      }
    }
  }, [isVisible, menuState, networkMgr]);

  const handleHostGame = () => {
    setMenuState("host");
    setIsConnecting(true);

    networkMgr.init(true, () => {
      setIsConnecting(false);
      const code = networkMgr.generateId();
      setHostCode(code);
    });
  };

  const handleJoinGame = () => {
    setMenuState("join");
    setJoinCode("");
    setJoinStatus("");
  };

  const handleConnectJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      setJoinStatus("Invalid code (must be 4 characters)");
      return;
    }

    setIsConnecting(true);
    setJoinStatus("Connecting...");

    networkMgr.connect(code, () => {
      setIsConnecting(false);
      setJoinStatus("Connected!");
      // Call onConnected after a brief delay to show success message
      setTimeout(() => {
        if (onConnected) onConnected();
      }, 500);
    });
  };

  const handleBackToMenu = () => {
    setMenuState("main");
    setJoinCode("");
    setJoinStatus("");
    setHostCode("");
  };

  const handleClose = () => {
    setMenuState("main");
    setJoinCode("");
    setJoinStatus("");
    setHostCode("");
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        {menuState === "main" && (
          <>
            <div className="modal-title">Play Online</div>
            <div style={{ marginTop: 20 }}>
              <button
                className="btn-modal-primary"
                onClick={handleHostGame}
                style={{ marginBottom: 10 }}
              >
                Host Game
              </button>
              <button
                className="btn-modal-primary"
                onClick={handleJoinGame}
                style={{ marginBottom: 10 }}
              >
                Join Game
              </button>
              <button
                className="btn-modal-primary"
                onClick={handleClose}
                style={{ background: "rgba(70, 70, 100, 0.85)" }}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {menuState === "host" && (
          <>
            <div className="modal-title">Hosting Game</div>
            <div style={{ marginTop: 20, textAlign: "center" }}>
              {isConnecting ? (
                <p>Setting up...</p>
              ) : (
                <>
                  <p style={{ marginBottom: 10 }}>Share this code:</p>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#42f59b",
                      marginBottom: 20,
                      letterSpacing: "0.2em",
                      fontFamily: "monospace",
                    }}
                  >
                    {hostCode}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#a5a6b5" }}>
                    Waiting for opponent...
                  </p>
                </>
              )}
              <button
                className="btn-modal-primary"
                onClick={handleBackToMenu}
                style={{ marginTop: 20 }}
              >
                Back
              </button>
            </div>
          </>
        )}

        {menuState === "join" && (
          <>
            <div className="modal-title">Join Game</div>
            <div style={{ marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Host Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 4-character code"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().slice(0, 4))
                  }
                  disabled={isConnecting}
                  maxLength="4"
                />
              </div>

              {joinStatus && (
                <div
                  style={{
                    marginBottom: 10,
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    background:
                      joinStatus === "Connected!"
                        ? "rgba(40, 140, 90, 0.3)"
                        : "rgba(180, 120, 40, 0.35)",
                    border:
                      joinStatus === "Connected!"
                        ? "1px solid rgba(80, 220, 150, 0.9)"
                        : "1px solid rgba(240, 180, 80, 0.9)",
                    textAlign: "center",
                  }}
                >
                  {joinStatus}
                </div>
              )}

              <button
                className="btn-modal-primary"
                onClick={handleConnectJoin}
                disabled={isConnecting || joinCode.length !== 4}
                style={{ marginBottom: 10 }}
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </button>

              <button
                className="btn-modal-primary"
                onClick={handleBackToMenu}
                style={{ background: "rgba(70, 70, 100, 0.85)" }}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
