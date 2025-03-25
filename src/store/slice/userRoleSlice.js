import { createSlice } from '@reduxjs/toolkit';

const userRoleSlice = createSlice({
    name: 'user',
    initialState: { role: "USER" },
    reducers: {
        setUserRole: (state, action) => { state.role = action.payload; }
    }
});

export const { setUserRole } = userRoleSlice.actions;
export default userRoleSlice.reducer;