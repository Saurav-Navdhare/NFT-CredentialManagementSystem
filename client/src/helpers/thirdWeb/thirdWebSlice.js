import { createSlice } from "@reduxjs/toolkit";


const thirdWebSlice = createSlice({
    name: "thirdweb",
    initialState: {
        contract: null,
        mutate: null,
        client: null
    },
    reducers: {
        setClient: (state, action) => {
            state.client = action.payload;
        },
        setMutate: (state, action) => {
            state.mutate = action.payload;
        },
        setContract: (state, action) => {
            state.contract = action.payload;
        }
    }
})

export const { setContract, setMutate, setClient } = thirdWebSlice.actions;
export default thirdWebSlice.reducer;