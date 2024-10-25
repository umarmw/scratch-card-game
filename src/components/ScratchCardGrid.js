import React, { useState, useEffect, useRef } from "react";

// Smile and Sad icons as emojis (replace these with images if needed)
const SmileIcon = () => <span role="img" aria-label="smile">😊</span>;
const SadIcon = () => <span role="img" aria-label="sad">😢</span>;

// Utility to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const ScratchCardGrid = ({ rows = 4, cols = 3, winCount = 1 }) => {
  const totalCells = rows * cols;
  const [grid, setGrid] = useState([]);
  const [scratchedCells, setScratchedCells] = useState([]);
  const [result, setResult] = useState(null); // Result state to show total wins or "Out of luck!"

  useEffect(() => {
    // Initialize the grid with winCount "win" cells and the rest "lose"
    const initialGrid = Array(totalCells).fill("lose");
    for (let i = 0; i < winCount; i++) {
      initialGrid[i] = "win";
    }
    setGrid(shuffleArray(initialGrid));
  }, [winCount, totalCells]);

  const handleScratch = (index) => {
    if (!scratchedCells.includes(index)) {
      const newScratchedCells = [...scratchedCells, index];
      setScratchedCells(newScratchedCells);

      // When all cells are scratched, calculate total wins
      if (newScratchedCells.length === totalCells) {
        const totalWins = newScratchedCells.reduce((count, cellIndex) => {
          return grid[cellIndex] === "win" ? count + 1 : count;
        }, 0);
        setResult(totalWins > 0 ? `Total Wins: ${totalWins}` : "Out of luck!");
      }
    }
  };

  const renderCellContent = (index) => {
    return grid[index] === "win" ? <SmileIcon /> : <SadIcon />;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ 
          display: "grid", 
          gridTemplateColumns: `repeat(${cols}, 100px)`, 
          gap: "10px",
          backgroundColor: "#8a46b0", // Grid background color
          border: "2px solid #6235a1", // Grid border color
          padding: "10px",
          borderRadius: "10px"
        }}
      >
        {grid.map((cell, index) => (
          <ScratchableCell
            key={index}
            onScratch={() => handleScratch(index)}
            renderContent={() => renderCellContent(index)}
          />
        ))}
      </div>

      {/* Display result when all cells are scratched */}
      {scratchedCells.length === totalCells && (
        <div style={{ marginTop: "20px", fontSize: "1.5rem" }}>
          {result}
        </div>
      )}
    </div>
  );
};

const ScratchableCell = ({ onScratch, renderContent }) => {
  const canvasRef = useRef(null);
  const [scratched, setScratched] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Create a circular scratch area with #f2f1df background and #948780 border
    ctx.fillStyle = "#f2f1df"; // Scratchable area background color
    ctx.strokeStyle = "#948780"; // Scratchable area border color
    ctx.lineWidth = 5;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;

    // Draw the circle
    const radius = canvas.width / 2 - 10;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // To create an eraser effect, we use "destination-out" blending mode
    const scratch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2, false);
      ctx.fill();
    };

    const handleMouseMove = (e) => {
      scratch(e);
      if (checkIfScratchedEnough()) {
        setScratched(true);
        onScratch();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [onScratch]);

  // Check if enough area has been scratched off to reveal content
  const checkIfScratchedEnough = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let scratchedPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        scratchedPixels++;
      }
    }

    const percentageScratched = (scratchedPixels / (canvas.width * canvas.height)) * 100;
    return percentageScratched > 50; // Scratch threshold of 50%
  };

  return (
    <div style={{ 
        position: "relative", 
        width: "100px", 
        height: "100px", 
        border: "2px solid #6235a1", // Cell border color
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "#e0cabf", // Cell background color
        borderRadius: "10px"
      }}
    >
      {/* Hidden content that will be revealed */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: scratched ? "flex" : "none", alignItems: "center", justifyContent: "center" }}>
        {renderContent()}
      </div>

      {/* Circular Canvas to simulate the scratch effect */}
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100px",
          height: "100px",
          cursor: "pointer",
          borderRadius: "50%",
        }}
      ></canvas>
    </div>
  );
};

export default ScratchCardGrid;
