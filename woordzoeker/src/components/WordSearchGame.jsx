import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWords } from "../app/data/words/wordsSlice";
import anime from "animejs";

const WordSearchGame = ({ themeId }) => {
  const dispatch = useDispatch();
  const { words, status } = useSelector((state) => state.words);
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [markedCells, setMarkedCells] = useState([]);
  const [gridSize, setGridSize] = useState(8); // Dynamisch gridSize

  // INFO: Bereken gridSize op basis van schermgrootte
  const calculateGridSize = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Neem de kleinere dimensie en pas een schaal toe
    const maxSize = Math.min(screenWidth, screenHeight);
    const size = Math.floor(maxSize / 50); // Stel celgrootte in op ~50px
    return Math.max(8, Math.min(size, 20)); // Limiteer tussen 8x8 en 20x20
  };

  // INFO: Update gridSize bij component mount en schermresizing
  useEffect(() => {
    const updateGridSize = () => {
      setGridSize(calculateGridSize());
    };

    updateGridSize(); // Initieel instellen
    window.addEventListener("resize", updateGridSize); // Dynamisch aanpassen bij resizing

    return () => {
      window.removeEventListener("resize", updateGridSize);
    };
  }, []);

  // INFO: Ophalen van woorden bij wijziging van themeId
  useEffect(() => {
    if (themeId) {
      dispatch(fetchWords(themeId));
    }
  }, [themeId, dispatch]);

  // INFO: Genereert het grid en plaatst de woorden
  useEffect(() => {
    if (status === "succeeded" && words?.length > 0) {
      const initializeGrid = () =>
        Array.from({ length: gridSize }, () =>
          Array.from({ length: gridSize }, () => "")
        );

      const directions = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: -1 },
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
  }, [status, words, gridSize]);

  // INFO: Anime.js animatiefunctie
  const playAnimation = () => {
    anime({
      targets: ".woordzoeker-grid div", // Selecteer de cellen in het grid
      scale: [
        { value: 1.5, duration: 500 },
        { value: 1, duration: 500 },
      ],
      backgroundColor: "#AAF683",
      easing: "easeInOutQuad",
      delay: anime.stagger(50), // Stagger de animatie
    });
  };

  // INFO: Controleer of alle woorden gevonden zijn
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
      playAnimation(); // Speel de animatie af
      console.log("Alle woorden gevonden!");
    }
  }, [markedCells, words, grid]);

  // INFO: Beheer selectie en markering
  const handleCellClick = (rowIndex, colIndex) => {
    const newSelectedCells = [...selectedCells, { rowIndex, colIndex }];
    setSelectedCells(newSelectedCells);

    setTimeout(() => {
      setSelectedCells((prev) =>
        prev.filter(
          (cell) => !(cell.rowIndex === rowIndex && cell.colIndex === colIndex)
        )
      );
    }, 4000);

    words.forEach((word) => {
      const wordLetters = word.name.toUpperCase().split("");
      const matches = wordLetters.every((_, idx) => {
        const cell = newSelectedCells[idx];
        return (
          cell && grid[cell.rowIndex]?.[cell.colIndex] === wordLetters[idx]
        );
      });

      if (matches) {
        setMarkedCells((prev) => [...prev, ...newSelectedCells]);
      }
    });
  };

  if (status === "loading") return <p>Woorden laden...</p>;
  if (status === "failed") return <p>Fout bij het laden van woorden.</p>;

  return (
    <div className="woordzoeker">
      <h2>Woordzoeker van de dag!</h2>

      {/* Woordenlijst */}
      <div className="woordenlijst">
        <ul className="list-disc list-inside">
          {words.map((word) => {
            const wordLetters = word.name.toUpperCase().split("");

            // Controleer of alle letters van het woord in `markedCells` staan
            const isWordFound = wordLetters.every((letter) =>
              markedCells.some(
                (cell) => grid[cell.rowIndex]?.[cell.colIndex] === letter
              )
            );

            return (
              <li
                key={word.id}
                className={`text-lg ${
                  isWordFound ? "line-through text-green-500" : ""
                }`}
                style={{
                  backgroundColor: isWordFound ? "lightgreen" : "transparent",
                  padding: "5px",
                  borderRadius: "4px",
                }}
              >
                {word.name}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="woordzoeker-grid">
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
                    ? "lightgreen"
                    : selectedCells.some(
                        (cell) =>
                          cell.rowIndex === rowIndex &&
                          cell.colIndex === colIndex
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
    </div>
  );
};

export default WordSearchGame;
