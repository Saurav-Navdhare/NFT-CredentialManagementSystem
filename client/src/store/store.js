import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userRoleSlice";

const store = configureStore({
    reducer: {
        user: userReducer
    }
});

export default store;
