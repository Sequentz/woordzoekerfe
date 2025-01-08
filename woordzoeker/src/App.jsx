import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchThemes } from "./app/data/themes/themesSlice";
import WheelComponent from "./components/WheelComponent";
import WordSearchGame from "./components/WordSearchGame";
import CompletedComponent from "./components/CompletedComponent";

const App = () => {
  const dispatch = useDispatch();
  const { themes, status } = useSelector((state) => state.themes);

  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    dispatch(fetchThemes());
  }, [dispatch]);

  // Controleer of de puzzel al voltooid is
  useEffect(() => {
    const completedTime = localStorage.getItem("completedTime");
    const now = Math.floor(Date.now() / 1000);

    if (completedTime) {
      const elapsed = now - parseInt(completedTime, 10);
      if (elapsed < 24 * 60 * 60) {
        setIsCompletedToday(true);
        setTimeLeft(24 * 60 * 60 - elapsed);
      } else {
        // Reset de status als de tijd verlopen is
        localStorage.removeItem("completedTime");
        setIsCompletedToday(false);
      }
    }
  }, []);

  // Timer voor aftellen
  useEffect(() => {
    if (isCompletedToday) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isCompletedToday]);

  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  if (status === "loading") return <p>Loading themes...</p>;
  if (status === "failed") return <p>Failed to load themes.</p>;

  return (
    <div>
      {isCompletedToday ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>Je hebt de puzzel vandaag al voltooid!</h3>
          <p>
            Kom morgen terug! Time left: <strong>{formatTime(timeLeft)}</strong>
          </p>
        </div>
      ) : (
        <>
          {!selectedTheme ? (
            <WheelComponent
              themes={themes}
              onSelect={(theme) => setSelectedTheme(theme)}
            />
          ) : (
            <WordSearchGame themeId={selectedTheme.id} />
          )}
        </>
      )}
    </div>
  );
};

export default App;
