import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// INFO: Basis URL van de API
const API_BASE_URL = "https://eindwerkbe.ddev.site/api/v1";

// INFO: Async Thunk om de woorden op te halen.
export const fetchWords = createAsyncThunk(
  "words/fetchWords",
  async (themeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/themes/${themeId}/words`
      );
      console.log("API Response:", response.data);
      return response.data.words;
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
    foundWords: [],
    markedCells: [],
  },
  reducers: {
    resetGame: (state) => {
      state.words = [];
      state.status = "idle";
      state.foundWords = [];
      state.markedCells = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWords.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        console.log("Payload in Reducer:", action.payload);
        state.status = "succeeded";
        state.words = action.payload || [];
      })
      .addCase(fetchWords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Er is een fout opgetreden.";
      });
  },
});

export const { resetGame } = wordsSlice.actions;
export default wordsSlice.reducer;
