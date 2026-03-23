import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialState {
  currentStep: number;
  selections: Record<string, string>;
  customRequirements: string;
}
const initialState: InitialState = {
  currentStep: 0,
  selections: {},
  customRequirements: '',
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setSelection: (state, action) => {
      const { sectionId, optionLabel } = action.payload;
      state.selections[sectionId] = optionLabel;
    },
    setSelections: (state, action) => {
      const { selections } = action.payload;
      state.selections = selections;
    },
    setCustomRequirements: (state, action: PayloadAction<string>) => {
      state.customRequirements = action.payload;
    },
    resetBuilder: (state) => {
      state.currentStep = 0;
      state.selections = {};
      state.customRequirements = '';
    },
  },
});

export const { setStep, setSelection, setSelections, setCustomRequirements, resetBuilder } = builderSlice.actions;

export default builderSlice.reducer;
