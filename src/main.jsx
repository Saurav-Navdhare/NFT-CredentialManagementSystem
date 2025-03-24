import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThirdwebProvider } from "thirdweb/react";
import { Provider } from "react-redux";
import appStore from "./app/store"


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore}>
      <ThirdwebProvider>
        <App />
      </ThirdwebProvider>
    </Provider>
  </StrictMode>
)
