
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import './App.css'

function App() {
  const [board, setBoard] = useState(
    Array(9)
      .fill(0)
      .map(() => Array(9).fill(""))
  );
  const [solutions, setSolutions] = useState([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);

  const isValid = (grid, row, col, val) => {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] == val || grid[i][col] == val) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (grid[r][c] == val) return false;
      }
    }
    return true;
  };

  const updateGrid = (row, col, val) => {
    setBoard((prev) => {
      const next = prev.map((r) => [...r]);
      if (val === "") {
        next[row][col] = "";
        return next;
      }
      if (!isValid(next, row, col, Number(val))) {
        toast.error(`❌ Invalid placement: ${val} at [${row + 1},${col + 1}]`);
        return prev;
      }
      next[row][col] = Number(val);
      return next;
    });
  };

  const solveSudoku = (ans, grid, row = 0, col = 0) => {
    if (ans.length >= 5 ) return;
    if (row === 9) {
      ans.push(grid.map((r) => [...r]));
      return;
    }
    if (col === 9) {
      solveSudoku(ans, grid, row + 1, 0);
      return;
    }
    if (grid[row][col] !== "") {
      solveSudoku(ans, grid, row, col + 1);
      return;
    }
    for (let num = 1; num <= 9; num++) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num;
        solveSudoku(ans, grid, row, col + 1);
        grid[row][col] = "";
        if (ans.length >= 5) return;
      }
    }
  };

  const handleSolve = () => {
    const temp = structuredClone(board);
    const ans = [];
    solveSudoku(ans, temp);
    if (ans.length === 0) {
      toast.error("❌ No solution found!");
      setSolutions([]);
    } else {
      toast.success(
        `✅ Found ${ans.length} solution${ans.length > 1 ? "s" : ""}`
      );
      console.log(ans);
      setSolutions(ans);
      setCurrentSolutionIndex(0);
    }
  };

  const renderBoard = (grid, isSolution = false) => (
    <div className="grid grid-cols-9 gap-0 text-black m-2">
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <input
            key={`${r}-${c}-${isSolution ? "sol" : "in"}`}
            className={`
              w-10 h-10 text-center border border-black font-bold
              ${r % 3 === 0 ? "border-t-4" : ""}
              ${c % 3 === 0 ? "border-l-4" : ""}
              ${r === 8 ? "border-b-4" : ""}
              ${c === 8 ? "border-r-4" : ""}
              ${
                (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0
                  ? "bg-green-200"
                  : "bg-white"
              }
              ${
                isSolution
                  ? board[r][c] !== ""
                    ? "text-black"
                    : "text-blue-600"
                  : "text-black"
              }
            `}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={isSolution}
            value={cell || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^[1-9]$/.test(v)) {
                updateGrid(r, c, v);
              }
            }}
            onKeyDown={(e) => {
              if (
                !e.key.match(/^[1-9]$/) &&
                ![
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                ].includes(e.key)
              )
                e.preventDefault();
            }}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-2">🧩 Sudoku Solver</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <h2 className="font-semibold mb-2 text-center">Your Input</h2>
          {renderBoard(board)}
        </div>

        <div>
          <h2 className="font-semibold mb-2 text-center">Solved</h2>
          {solutions.length > 0 ? (
            <>
              {renderBoard(solutions[currentSolutionIndex], true)}
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() =>
                    setCurrentSolutionIndex((idx) => Math.max(idx - 1, 0))
                  }
                  disabled={currentSolutionIndex === 0}
                  className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentSolutionIndex((idx) =>
                      Math.min(idx + 1, solutions.length - 1)
                    )
                  }
                  disabled={currentSolutionIndex === solutions.length - 1}
                  className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No solution yet</p>
          )}
        </div>
      </div>

      <button
        onClick={handleSolve}
        className="bg-green-600 text-white font-semibold py-2 px-6 rounded hover:bg-green-700 transition"
      >
        Solve
      </button>
    </div>
  );
};

export default App
