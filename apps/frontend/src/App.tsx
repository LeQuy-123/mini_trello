import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "@pages/SignIn";
import SignUp from "@pages/SignUp";
import Boards from "@pages/Boards";
import ProtectedRoute from "@auth/ProtectedRoute";
import { createTheme, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { useCustomTheme } from "@utils/useCustomTheme";
import CssBaseline from "@mui/material/CssBaseline";
import PublicRoute from "@auth/PublicRoute";

function App() {
  const { mode } = useCustomTheme()
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
        <Route path="/signin" element={<PublicRoute>
          <SignIn />
        </PublicRoute>} />
        <Route path="/signup" element={<PublicRoute>
          <SignUp />
        </PublicRoute>} />
        <Route
          path="/boards"
          element={
            <ProtectedRoute>
              <Boards />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </ThemeProvider>

  );
}

export default App;
