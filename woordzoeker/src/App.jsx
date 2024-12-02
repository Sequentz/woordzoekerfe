import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchThemes } from "./app/data/themes/themesSlice";
import WheelComponent from "./components/WheelComponent";
import WordSearchGame from "./components/WordSearchGame";

const App = () => {
  const dispatch = useDispatch();
  const { themes, status } = useSelector((state) => state.themes);

  const [selectedTheme, setSelectedTheme] = useState(null);

  React.useEffect(() => {
    dispatch(fetchThemes());
  }, [dispatch]);

  if (status === "loading") return <p>Loading themes...</p>;
  if (status === "failed") return <p>Failed to load themes.</p>;

  return (
    <div>
      {!selectedTheme ? (
        <WheelComponent
          themes={themes}
          onSelect={(theme) => setSelectedTheme(theme)}
        />
      ) : (
        <WordSearchGame themeId={selectedTheme.id} />
      )}
    </div>
  );
};

export default App;
