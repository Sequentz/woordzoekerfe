import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL voor API
const API_BASE_URL = "https://eindwerkbe.ddev.site/api/v1";

// Async thunk voor woorden ophalen op basis van thema
export const fetchWords = createAsyncThunk(
  "words/fetchWords",
  async (themeId) => {
    const response = await axios.get(`${API_BASE_URL}/themes/${themeId}/words`);
    return response.data.data; // Laravel API retourneert vaak een 'data' veld.
  }
);

const wordsSlice = createSlice({
  name: "words",
  initialState: { words: [], status: "idle" },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWords.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.words = action.payload;
      })
      .addCase(fetchWords.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default wordsSlice.reducer;
