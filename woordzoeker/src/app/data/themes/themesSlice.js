import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL voor API
const API_BASE_URL = "https://eindwerkbe.ddev.site/api/v1";

// Async thunk voor thema's ophalen
export const fetchThemes = createAsyncThunk("themes/fetchThemes", async () => {
  const response = await axios.get(`${API_BASE_URL}/themes`);
  return response.data.data; // Laravel API retourneert vaak een 'data' veld.
});

const themesSlice = createSlice({
  name: "themes",
  initialState: { themes: [], status: "idle", selectedTheme: null },
  reducers: {
    selectTheme: (state, action) => {
      state.selectedTheme = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchThemes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.themes = action.payload;
      })
      .addCase(fetchThemes.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { selectTheme } = themesSlice.actions;
export default themesSlice.reducer;
