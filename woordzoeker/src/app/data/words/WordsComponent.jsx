import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchWords } from "./wordsSlice";

const WordsComponent = ({ themeId }) => {
  const dispatch = useDispatch();
  const { words, status } = useSelector((state) => state.words);

  useEffect(() => {
    dispatch(fetchWords(themeId));
  }, [dispatch, themeId]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "failed") return <p>Error loading words.</p>;

  return (
    <div>
      <h2>Words for Theme</h2>
      <ul>
        {words.map((word) => (
          <li key={word.id}>{word.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default WordsComponent;
