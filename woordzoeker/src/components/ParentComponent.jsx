import React, { useEffect, useState } from "react";
import WordSearchGame from "./WordSearchGame";
import WheelComponent from "./WheelComponent";
import axios from "axios";

const ParentComponent = () => {
  const [themes, setThemes] = useState([]); // Dynamische themalijst
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API URL
  const API_BASE_URL = "https://eindwerkbe.ddev.site/api/v1";

  // Thema's ophalen van de API
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/themes`);
        setThemes(response.data.data); // Stel de thema's in (API retourneert vaak een 'data' veld)
        setLoading(false);
      } catch (err) {
        console.error("Fout bij het ophalen van thema's:", err);
        setError("Kon thema's niet laden.");
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Callback om het geselecteerde thema door te geven
  const handleThemeSelect = (theme) => {
    console.log("Geselecteerd thema:", theme);
    setSelectedThemeId(theme.id); // Stel het geselecteerde thema in
  };

  if (loading) return <p>Thema's laden...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Woordzoeker</h1>
      <WheelComponent themes={themes} onSelect={handleThemeSelect} />
      {selectedThemeId && <WordSearchGame themeId={selectedThemeId} />}
    </div>
  );
};

export default ParentComponent;
