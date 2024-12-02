import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWords } from "../app/data/words/wordsSlice";

const WordSearchGame = ({ themeId }) => {
  const dispatch = useDispatch();
  const { words, status } = useSelector((state) => state.words); // Gebruik Redux-state
  const [grid, setGrid] = useState([]);
  const gridSize = 10;

  // Haal woorden op bij verandering van themeId
  useEffect(() => {
    if (themeId) {
      dispatch(fetchWords(themeId));
    }
  }, [themeId, dispatch]);

  // Genereer woordzoeker zodra de woorden geladen zijn
  useEffect(() => {
    if (status === "succeeded" && words?.length > 0) {
      console.log("Woorden ontvangen in WordSearchGame:", words);

      const initializeGrid = () =>
        Array.from({ length: gridSize }, () =>
          Array.from({ length: gridSize }, () => "")
        );

      const placeWords = (grid, words) => {
        words.forEach((word) => {
          const wordArray = word.name.toUpperCase().split(""); // Woord in hoofdletters
          const direction = Math.random() > 0.5 ? "horizontal" : "vertical";

          let row, col;
          let placed = false;

          while (!placed) {
            row = Math.floor(Math.random() * gridSize);
            col = Math.floor(Math.random() * gridSize);

            if (
              direction === "horizontal" &&
              col + wordArray.length <= gridSize &&
              wordArray.every((_, idx) => grid[row][col + idx] === "")
            ) {
              wordArray.forEach((letter, idx) => {
                grid[row][col + idx] = letter;
              });
              placed = true;
            } else if (
              direction === "vertical" &&
              row + wordArray.length <= gridSize &&
              wordArray.every((_, idx) => grid[row + idx][col] === "")
            ) {
              wordArray.forEach((letter, idx) => {
                grid[row + idx][col] = letter;
              });
              placed = true;
            }
          }
        });

        return grid.map((row) =>
          row.map((cell) =>
            cell === ""
              ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) // Random letter
              : cell
          )
        );
      };

      const newGrid = placeWords(initializeGrid(), words);
      console.log("Gegenereerde grid:", newGrid);
      setGrid(newGrid);
    }
  }, [status, words]);

  if (status === "loading") return <p>Woorden laden...</p>;
  if (status === "failed") return <p>Fout bij het laden van woorden.</p>;
  if (!grid || grid.length === 0) return <p>Grid wordt gegenereerd...</p>;

  return (
    <div className="word-search-grid">
      <h2>Word Search Grid</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 40px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: 40,
                height: 40,
                border: "1px solid black",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
              }}
            >
              {cell}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WordSearchGame;
