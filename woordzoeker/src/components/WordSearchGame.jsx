import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWords } from "../app/data/words/wordsSlice";
import { Fireworks } from "fireworks-js";

const WordSearchGame = ({ themeId }) => {
  const dispatch = useDispatch();
  const { words, status } = useSelector((state) => state.words);
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [markedCells, setMarkedCells] = useState([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const gridSize = 10;
  const fireworksContainerRef = useRef(null);

  // INFO: VUURWERKFUNCTIE
  const startFireworks = () => {
    if (fireworksContainerRef.current) {
      console.log("Start vuurwerk...");
      const fireworks = new Fireworks(fireworksContainerRef.current, {
        hue: { min: 0, max: 360 },
        delay: { min: 15, max: 30 },
        rocketsPoint: 50,
        speed: 10,
        acceleration: 1.05,
        friction: 0.98,
        gravity: 1.5,
        particles: 100,
        trace: 3,
        explosion: 20,
        boundaries: {
          x: 0,
          y: 0,
          width: fireworksContainerRef.current.offsetWidth,
          height: fireworksContainerRef.current.offsetHeight,
        },
      });

      fireworks.start();
      setTimeout(() => {
        fireworks.stop();
        console.log("Vuurwerk gestopt.");
      }, 10000);
    }
  };

  // INFO: Ophalen van woorden bij het wijzigen van themeId
  useEffect(() => {
    if (themeId) {
      dispatch(fetchWords(themeId));
    }
  }, [themeId, dispatch]);

  //INFO: Genereert het grid en plaatst de woorden.
  useEffect(() => {
    if (status === "succeeded" && words?.length > 0) {
      const initializeGrid = () =>
        Array.from({ length: gridSize }, () =>
          Array.from({ length: gridSize }, () => "")
        );

      const directions = [
        { x: 1, y: 0 }, // INFO: Horizontaal
        { x: 0, y: 1 }, // INFO: Verticaal
        { x: 1, y: 1 }, // INFO: Diagonaal naar rechts-onder
        { x: 1, y: -1 }, // INFO: Diagonaal naar rechts-boven
      ];

      const placeWords = (grid, words) => {
        words.forEach((word) => {
          const wordArray = word.name.toUpperCase().split("");
          let placed = false;

          while (!placed) {
            const direction =
              directions[Math.floor(Math.random() * directions.length)];
            const startRow = Math.floor(Math.random() * gridSize);
            const startCol = Math.floor(Math.random() * gridSize);

            const canPlace = wordArray.every((_, idx) => {
              const newRow = startRow + idx * direction.y;
              const newCol = startCol + idx * direction.x;

              return (
                newRow >= 0 &&
                newRow < gridSize &&
                newCol >= 0 &&
                newCol < gridSize &&
                grid[newRow][newCol] === ""
              );
            });

            if (canPlace) {
              wordArray.forEach((letter, idx) => {
                const newRow = startRow + idx * direction.y;
                const newCol = startCol + idx * direction.x;
                grid[newRow][newCol] = letter;
              });
              placed = true;
            }
          }
        });

        return grid.map((row) =>
          row.map((cell) =>
            cell === ""
              ? String.fromCharCode(65 + Math.floor(Math.random() * 26))
              : cell
          )
        );
      };

      const newGrid = placeWords(initializeGrid(), words);
      setGrid(newGrid);
    }
  }, [status, words]);

  // INFO: Controle of alle woorden gevonden zijn
  useEffect(() => {
    const allWordsFound = words.every((word) => {
      const wordLetters = word.name.toUpperCase().split("");
      return wordLetters.every((letter) =>
        markedCells.some(
          (cell) => grid[cell.rowIndex]?.[cell.colIndex] === letter
        )
      );
    });

    if (allWordsFound && words.length > 0) {
      console.log("Alle woorden gevonden!");
      setShowFireworks(true);
      startFireworks();
    }
  }, [markedCells, words, grid]);

  // INFO: Beheer selectie en markering
  const handleCellClick = (rowIndex, colIndex) => {
    const newSelectedCells = [...selectedCells, { rowIndex, colIndex }];
    setSelectedCells(newSelectedCells);

    // INFO: Reset de cel na 4  seconden
    setTimeout(() => {
      setSelectedCells((prev) =>
        prev.filter(
          (cell) => !(cell.rowIndex === rowIndex && cell.colIndex === colIndex)
        )
      );
    }, 4000);

    // INFO: Controle of een woord volledig is geselecteerd
    words.forEach((word) => {
      const wordLetters = word.name.toUpperCase().split("");
      const matches = wordLetters.every((_, idx) => {
        const cell = newSelectedCells[idx];
        return (
          cell && grid[cell.rowIndex]?.[cell.colIndex] === wordLetters[idx]
        );
      });

      if (matches) {
        // INFO: Voeg de cellen toe aan gemarkeerde cellen
        setMarkedCells((prev) => [...prev, ...newSelectedCells]);
      }
    });
  };

  if (status === "loading") return <p>Woorden laden...</p>;
  if (status === "failed") return <p>Fout bij het laden van woorden.</p>;

  return (
    <div>
      <h2>Woordzoeker</h2>
      {/* Container voor vuurwerk */}
      <div
        id="fireworks-container"
        ref={fireworksContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 9999,
          backgroundColor: "transparent",
        }}
      ></div>

      {/* Woordenlijst */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Zoek deze woorden:</h3>
        <ul className="list-disc list-inside">
          {words.map((word) => {
            const wordLetters = word.name.toUpperCase().split("");

            // INFO: Controle of alle letters van het woord in `markedCells` staan
            const isWordFound = wordLetters.every((letter, idx) =>
              markedCells.some(
                (cell) =>
                  grid[cell.rowIndex]?.[cell.colIndex] === wordLetters[idx]
              )
            );

            return (
              <li
                key={word.id}
                className={`text-lg ${
                  isWordFound ? "line-through text-green-500" : ""
                }`}
              >
                {word.name}
              </li>
            );
          })}
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
              onClick={() => handleCellClick(rowIndex, colIndex)}
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
