import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL voor API
const API_BASE_URL = "https://eindwerkbe.ddev.site/api/v1";

export const fetchWords = createAsyncThunk(
  "words/fetchWords",
  async (themeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/themes/${themeId}/words`
      );
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error fetching words:", error);
      return rejectWithValue(
        error.response?.data || "Fout bij ophalen van woorden."
      );
    }
  }
);

const wordsSlice = createSlice({
  name: "words",
  initialState: {
    words: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWords.pending, (state) => {
        state.status = "loading";
        state.error = null; // Reset eventuele eerdere fouten
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.words = action.payload;
      })
      .addCase(fetchWords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Er is een fout opgetreden.";
      });
  },
});

export default wordsSlice.reducer;
