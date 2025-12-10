import React, { useEffect, useRef, useState } from "react";

/*
  Canvas based secret writing pad converted for React.
  Keeps the original behavior: pen/eraser, brush size, color, clear.
*/

export default function SecretPad() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [padTool, setPadTool] = useState("pen");
  const [brushSize, setBrushSize] = useState(4);
  const [penColor, setPenColor] = useState("#000000");
  const lastRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setupCanvas();
    // re-setup on window resize
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function setupCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }

  function getPosFromEvent(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  }

  function startDraw(e) {
    setDrawing(true);
    const p = getPosFromEvent(e);
    lastRef.current = p;
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const p = getPosFromEvent(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;
    if (padTool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor;
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    }
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  }

  function endDraw() {
    setDrawing(false);
  }

  function clearPad() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div className="secret-pad-container">
      <div className="duel-panel-title">📝 Secret Writing Pad</div>
      <div style={{ fontSize: "0.7rem", color: "#a5a6b5", marginBottom: 4 }}>
        Think a secret number now. Do not type it anywhere. Use this pad just for yourself.
      </div>
      <canvas id="secretCanvas" ref={canvasRef} style={{ border: "1px solid #ddd", borderRadius: 8, width: "100%", height: 150 }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className="pad-controls">
        <button className={`pad-tool-btn ${padTool === "pen" ? "active" : ""}`} onClick={() => setPadTool("pen")}>Pen</button>
        <button className={`pad-tool-btn ${padTool === "eraser" ? "active" : ""}`} onClick={() => setPadTool("eraser")}>Eraser</button>
        <span style={{ fontSize: "0.7rem" }}>Size</span>
        <input className="pad-size-slider" type="range" min="2" max="16" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value, 10))} />
        <span style={{ fontSize: "0.7rem" }}>Color</span>
        <input className="pad-color-picker" type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
        <button className="pad-tool-btn" onClick={clearPad}>Clear</button>
      </div>
    </div>
  );
}
