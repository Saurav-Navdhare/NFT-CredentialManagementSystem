import { configureStore } from "@reduxjs/toolkit";
import thirdWebReducer from "../helpers/thirdWeb/thirdWebSlice";


const appStore = configureStore({
    reducer: thirdWebReducer
});

export default appStore;