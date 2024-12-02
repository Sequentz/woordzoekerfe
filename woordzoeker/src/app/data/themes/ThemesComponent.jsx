import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchThemes, selectTheme } from "./themesSlice";
import { fetchWords } from "../words/wordsSlice";

const ThemesComponent = ({ onSelect }) => {
  const dispatch = useDispatch();
  const { themes, status } = useSelector((state) => state.themes);

  useEffect(() => {
    dispatch(fetchThemes());
  }, [dispatch]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "failed") return <p>Error loading themes.</p>;

  return (
    <div>
      <h2>Select a Theme</h2>
      {themes.map((theme) => (
        <button key={theme.id} onClick={() => onSelect(theme)}>
          {theme.name}
        </button>
      ))}
    </div>
  );
};

export default ThemesComponent;
