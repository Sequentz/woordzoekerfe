import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL voor API
const API_BASE_URL = "https://eindwerkbe.ddev.site/api/v1";

// Async Thunk voor woorden ophalen
export const fetchWords = createAsyncThunk(
  "words/fetchWords",
  async (themeId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/themes/${themeId}/words`
      );
      console.log("API Response:", response.data); // Controleer de structuur
      return response.data.words; // Haal alleen de woordenlijst op
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
    foundWords: [], // Toegevoegd voor gevonden woorden
    markedCells: [], // Toegevoegd voor gemarkeerde cellen
  },
  reducers: {
    markWordAsFound: (state, action) => {
      // Voeg een gevonden woord toe aan foundWords
      const word = action.payload;
      if (!state.foundWords.includes(word)) {
        state.foundWords.push(word);
      }
    },
    markCells: (state, action) => {
      // Markeer cellen als onderdeel van een gevonden woord
      state.markedCells = [...state.markedCells, ...action.payload];
    },
    resetGame: (state) => {
      // Reset de state voor een nieuw spel
      state.foundWords = [];
      state.markedCells = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWords.pending, (state) => {
        state.status = "loading";
        state.error = null; // Reset eventuele eerdere fouten
      })
      .addCase(fetchWords.fulfilled, (state, action) => {
        console.log("Payload in Reducer:", action.payload);
        state.status = "succeeded";
        state.words = action.payload || []; // Zet de opgehaalde woorden in de state
      })
      .addCase(fetchWords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Er is een fout opgetreden.";
      });
  },
});

// Exporteer de acties en reducer
export const { markWordAsFound, markCells, resetGame } = wordsSlice.actions;
export default wordsSlice.reducer;
