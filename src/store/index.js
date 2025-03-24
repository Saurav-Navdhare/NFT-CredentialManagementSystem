import { configureStore } from '@reduxjs/toolkit';
import credentialReducer from './credentialSlice';
import userReducer from './userSlice';
import accessRequestReducer from './accessRequestSlice';

export const store = configureStore({
    reducer: {
        credentials: credentialReducer,
        user: userReducer,
        accessRequests: accessRequestReducer,
    },
});