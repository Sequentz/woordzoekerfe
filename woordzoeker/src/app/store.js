import { configureStore } from "@reduxjs/toolkit";
import themesReducer from "../app/data/themes/themesSlice";
import wordsReducer from "../app/data/words/wordsSlice";

const store = configureStore({
  reducer: {
    themes: themesReducer,
    words: wordsReducer,
  },
});

export default store;
