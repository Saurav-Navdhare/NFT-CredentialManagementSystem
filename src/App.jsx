import './App.css'
import { useEffect } from "react"
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { FetchRole } from "./services/ContractInteraction"
import ProtectedRoute from './components/ProtectedRoute';

import { setUserRole } from "./store/slice/userRoleSlice";
import { useDispatch, useSelector } from "react-redux";


import Admin from "./components/Admin/Admin"
import Moderator from "./components/Moderator/Moderator"
import Institution from "./components/Institution/Institution"
import User from "./components/User/User"



function App() {

  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role);

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

  // const [account, setAccount] = useState(null);

  useEffect(() => {
    (async () => {
      const role = await FetchRole();
      dispatch(setUserRole(role))
      console.log(role)
    })()
  })

  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            {
              userRole ? (
                <>
                  <Route path="/" element={<Dashboard userRole={userRole} />} />

                  <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["ADMIN"]} />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>

                  <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["MODERATOR"]} />}>
                    <Route path="/moderator" element={<Moderator />} />
                  </Route>

                  <Route element={<ProtectedRoute userRole={userRole} allowedRoles={["INSTITUTION"]} />}>
                    <Route path="/institution" element={<Institution />} />
                  </Route>

                  <Route>
                    <Route path="/user" element={<User />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <Route path="*" element={
                  <>
                    <h1>Hello! Welcome to NFT CMS</h1>
                    <h1>Please wait we are identifying your role</h1>
                  </>
                } />
              )
            }
          </Routes>
        </Router>
      </ThemeProvider>
    </>
  )
}

export default App
