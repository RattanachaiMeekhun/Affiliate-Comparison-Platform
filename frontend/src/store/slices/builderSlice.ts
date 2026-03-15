import { createSlice } from '@reduxjs/toolkit';

interface InitialState {
  currentStep: number;
  selections: Record<string, string>;
}
const initialState: InitialState = {
  currentStep: 0,
  selections: {},
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
    resetBuilder: (state) => {
      state.currentStep = 0;
      state.selections = {
        'use-case': 'use-1',
        budget: 'budget-2',
        ecosystem: 'eco-4',
        storage: 'st-2',
        memory: 'mem-2',
      };
    },
  },
});

export const { setStep, setSelection, setSelections, resetBuilder } = builderSlice.actions;

export default builderSlice.reducer;
