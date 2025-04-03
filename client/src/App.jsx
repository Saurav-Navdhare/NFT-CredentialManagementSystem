import './App.css'
import { createClient } from "./components/utils/client";
import UploadMedia from './components/UploadMedia';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setClient } from "./helpers/thirdWeb/thirdWebSlice";
import CustomConnectButton from './components/CustomConnectButton';

function App() {
  const dispatch = useDispatch()
  dispatch(setClient(createClient()));

  const theme = createTheme({
    palette: {
      // use this color palette 1A1A1D 3B1C32 6A1E55 A64D79
      primary: {
        main: '#A64D79',
      },
      secondary: {
        main: '#3B1C32',
        light: '#6A1E55'
      }
    }
  })

  return (
    <>
      <ThemeProvider theme={theme}>
        <div className="min-h-screen rounded-lg">
          <div>
            <CustomConnectButton />
          </div>
          <div>
            <h1 className="text-3xl font-bold underline mb-5">Welcome to NFT CMS</h1>
            <br />
            <UploadMedia
              classNames="p-16 mt-10 border border-neutral-500"
            />
          </div>
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
