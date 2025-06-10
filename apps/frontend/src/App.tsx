import { Routes, Route } from "react-router-dom";
import SignIn from "@pages/SignIn";
import SignUp from "@pages/SignUp";
import Boards from "@pages/Boards";
import ProtectedRoute from "@auth/ProtectedRoute";
import { createTheme, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { useCustomTheme } from "@utils/useCustomTheme";
import CssBaseline from "@mui/material/CssBaseline";

function App() {
  const {mode} =useCustomTheme()
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/boards"
          element={
            <ProtectedRoute>
              <Boards />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<SignIn />} />
      </Routes>
    </ThemeProvider>
   
  );
}

export default App;
