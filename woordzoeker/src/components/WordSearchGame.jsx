import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWords } from "../app/data/words/wordsSlice";

const WordSearchGame = ({ themeId }) => {
  const dispatch = useDispatch();
  const { words, status } = useSelector((state) => state.words); // Redux-state
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [markedCells, setMarkedCells] = useState([]);
  const gridSize = 10;

  // Haal woorden op bij wijziging van themeId
  useEffect(() => {
    if (themeId) {
      dispatch(fetchWords(themeId));
    }
  }, [themeId, dispatch]);

  // Genereer het grid en plaats woorden
  useEffect(() => {
    if (status === "succeeded" && words?.length > 0) {
      const initializeGrid = () =>
        Array.from({ length: gridSize }, () =>
          Array.from({ length: gridSize }, () => "")
        );

      const placeWords = (grid, words) => {
        words.forEach((word) => {
          const wordArray = word.name.toUpperCase().split("");
          const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
          let row,
            col,
            placed = false;

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
      setGrid(newGrid);
    }
  }, [status, words]);

  // Beheer selectie en markering
  const handleCellClick = (rowIndex, colIndex, letter) => {
    setSelectedCells((prev) => [...prev, { rowIndex, colIndex }]);
    words.forEach((word) => {
      const wordLetters = word.name.toUpperCase().split("");
      const cellsMatchWord = wordLetters.every((_, idx) => {
        const cell = selectedCells[idx];
        return cell && grid[cell.rowIndex][cell.colIndex] === wordLetters[idx];
      });
      if (cellsMatchWord) {
        setMarkedCells((prev) => [...prev, ...selectedCells]);
      }
    });
  };

  // Toon laad- of foutmeldingen
  if (status === "loading") return <p>Woorden laden...</p>;
  if (status === "failed") return <p>Fout bij het laden van woorden.</p>;

  return (
    <div>
      <h2>Woordzoeker</h2>
      {/* Woordenlijst */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Zoek deze woorden:</h3>
        <ul className="list-disc list-inside">
          {words?.length > 0 ? (
            words.map((word, index) => (
              <li
                key={index}
                className={`text-lg ${
                  markedCells.some((cell) =>
                    word.name
                      .toUpperCase()
                      .includes(grid[cell.rowIndex][cell.colIndex])
                  )
                    ? "line-through text-green-500"
                    : ""
                }`}
              >
                {word.name}
              </li>
            ))
          ) : (
            <p>Geen woorden gevonden.</p>
          )}
        </ul>
      </div>

      {/* Woordzoeker Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 40px)`,
          gap: "2px",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
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
                cursor: "pointer",
                backgroundColor: markedCells.some(
                  (cell) =>
                    cell.rowIndex === rowIndex && cell.colIndex === colIndex
                )
                  ? "green"
                  : selectedCells.some(
                      (cell) =>
                        cell.rowIndex === rowIndex && cell.colIndex === colIndex
                    )
                  ? "yellow"
                  : "white",
              }}
              onClick={() => handleCellClick(rowIndex, colIndex, letter)}
            >
              {letter}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WordSearchGame;
