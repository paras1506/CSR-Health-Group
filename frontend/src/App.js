import { Route, Routes, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Demands from "./pages/Demands";
import DonorPortal from "./pages/DonorPortal";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import VerifierDashboard from "./pages/VerifierDashboard";
import bgImage from "./assets/background.jpg";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext); // ✅ Moved inside App component

  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user?.role)) return <Navigate to="/" />;
    return element;
  };

  return (
    <div
      className="w-screen min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        className="mt-0 "
      />

      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/demands"
          element={<Demands setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/signup"
          element={<Signup setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/donor-portal"
          element={
            <ProtectedRoute
              element={<DonorPortal />}
              allowedRoles={["donor"]}
            />
          }
        />
        <Route
          path="/department-dashboard"
          element={
            <ProtectedRoute
              element={<DepartmentDashboard />}
              allowedRoles={["departmentHead"]}
            />
          }
        />
        <Route
          path="/verifier-dashboard"
          element={
            <ProtectedRoute
              element={<VerifierDashboard />}
              allowedRoles={["verifier"]}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
