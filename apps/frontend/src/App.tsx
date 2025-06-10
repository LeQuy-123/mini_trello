import { Routes, Route } from "react-router-dom";

import SignIn from "@pages/SignIn";
import SignUp from "@pages/SignUp";
import Boards from "@pages/Boards";
import ProtectedRoute from "@auth/ProtectedRoute";

function App() {
  return (
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
  );
}

export default App;
