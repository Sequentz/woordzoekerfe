import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWords } from "../app/data/words/wordsSlice";
import anime from "animejs";
import CompletedComponent from "./CompletedComponent";

const WordSearchGame = ({ themeId }) => {
  const dispatch = useDispatch();
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { words, status } = useSelector((state) => state.words);
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [markedCells, setMarkedCells] = useState([]);
  const [gridSize, setGridSize] = useState(8);
  const [showComponent, setShowComponent] = useState(false);

  // INFO: Bereken gridSize op basis van schermgrootte
  const calculateGridSize = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const maxSize = Math.min(screenWidth, screenHeight);
    const size = Math.floor(maxSize / 50);
    return Math.max(8, Math.min(size, 20));
  };
  // INFO: Functie om de tijd te formatteren
  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };
  // INFO: UseEffect voor isCompleted
  useEffect(() => {
    const completedTime = localStorage.getItem("completedTime");
    const now = Math.floor(Date.now() / 1000);

    if (completedTime) {
      const elapsed = now - parseInt(completedTime, 10);
      if (elapsed < 24 * 60 * 60) {
        setIsCompletedToday(true);
        setTimeLeft(24 * 60 * 60 - elapsed);
      }
    }

    // Start de timer als er nog tijd over is
    if (!isCompletedToday) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const allWordsFoundStatus = words.every((word) => {
      const wordLetters = word.name.toUpperCase().split("");
      return wordLetters.every((letter) =>
        markedCells.some(
          (cell) => grid[cell.rowIndex]?.[cell.colIndex] === letter
        )
      );
    });

    if (allWordsFoundStatus && words.length > 0) {
      playAnimation();

      setTimeout(() => {
        setShowComponent(true);
        const now = Math.floor(Date.now() / 1000);
        localStorage.setItem("completedTime", now.toString());
        setIsCompletedToday(true);
      }, 2000);
    }
  }, [markedCells, words, grid]);

  // INFO: UseEffect voor de timer
  useEffect(() => {
    const completedTime = localStorage.getItem("completedTime");
    const now = Math.floor(Date.now() / 1000);

    if (completedTime) {
      const elapsed = now - parseInt(completedTime, 10);
      if (elapsed < 24 * 60 * 60) {
        setIsCompletedToday(true);
        setTimeLeft(24 * 60 * 60 - elapsed);
      } else {
        // Als de tijd verlopen is, reset de status
        localStorage.removeItem("completedTime");
        setIsCompletedToday(false);
      }
    }

    // Als de puzzel voltooid is, toon direct de juiste status
    if (isCompletedToday) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCompletedToday]);

  useEffect(() => {
    const updateGridSize = () => {
      setGridSize(calculateGridSize());
    };

    updateGridSize();
    window.addEventListener("resize", updateGridSize);

    return () => {
      window.removeEventListener("resize", updateGridSize);
    };
  }, []);

  useEffect(() => {
    if (themeId) {
      dispatch(fetchWords(themeId));
    }
  }, [themeId, dispatch]);

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

  const playAnimation = () => {
    anime({
      targets: ".woordzoeker-grid div",
      scale: [
        { value: 1.5, duration: 500 },
        { value: 1, duration: 500 },
      ],
      backgroundColor: "#AAF683",
      easing: "easeInOutQuad",
      delay: anime.stagger(50),
    });
  };

  useEffect(() => {
    const allWordsFoundStatus = words.every((word) => {
      const wordLetters = word.name.toUpperCase().split("");
      return wordLetters.every((letter) =>
        markedCells.some(
          (cell) => grid[cell.rowIndex]?.[cell.colIndex] === letter
        )
      );
    });

    if (allWordsFoundStatus && words.length > 0) {
      playAnimation();

      setTimeout(() => {
        setShowComponent(true);
      }, 2000);

      console.log("Alle woorden gevonden!");
    }
  }, [markedCells, words, grid]);

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
      {isCompletedToday ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>Je hebt de puzzel vandaag al voltooid!</h3>
          <p>
            Kom morgen terug! Time left: <strong>{formatTime(timeLeft)}</strong>
          </p>
        </div>
      ) : (
        <>
          {showComponent ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <h3>Proficiat! Alle woorden zijn gevonden!</h3>
              <p>
                Time left: <strong>{formatTime(timeLeft)}</strong>
              </p>
            </div>
          ) : (
            <>
              <h2>Woordzoeker van de dag!</h2>
              {/* Woordenlijst */}
              <div className="woordenlijst">
                <ul className="list-disc list-inside">
                  {words.map((word) => {
                    const wordLetters = word.name.toUpperCase().split("");
                    const isWordFound = wordLetters.every((letter) =>
                      markedCells.some(
                        (cell) =>
                          grid[cell.rowIndex]?.[cell.colIndex] === letter
                      )
                    );

                    return (
                      <li
                        key={word.id}
                        className={`text-lg ${
                          isWordFound ? "line-through text-green-500" : ""
                        }`}
                        style={{
                          backgroundColor: isWordFound
                            ? "lightgreen"
                            : "transparent",
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

              {/* Woordzoeker grid */}
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
                              cell.rowIndex === rowIndex &&
                              cell.colIndex === colIndex
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
            </>
          )}
        </>
      )}
    </div>
  );
};
export default WordSearchGame;
