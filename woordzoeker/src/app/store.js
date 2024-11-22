import { configureStore } from "@reduxjs/toolkit";
import themesReducer from "../features/themes/themesSlice";
import wordsReducer from "../features/words/wordsSlice";

const store = configureStore({
  reducer: {
    themes: themesReducer,
    words: wordsReducer,
  },
});

export default store;
