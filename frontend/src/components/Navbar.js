import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext"; // ✅ Use Context
import logo from "../assets/Logo.svg";

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated, user } = useContext(AuthContext); // ✅ Get auth state
  const [userInitial, setUserInitial] = useState("");
  const navigate = useNavigate();

  // Set user initial from context
  useEffect(() => {
    if (user) {
      setUserInitial(user?.organisationName?.charAt(0).toUpperCase() || "");
    }
  }, [user]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged Out");
    navigate("/login"); // ✅ Redirect to login after logout
  };

  return (
    <div className="flex justify-between items-center w-11/12 max-w-[1160px] py-4 mx-auto">
      <Link to="/">
        <img src={logo} alt="Logo" width={160} height={32} loading="lazy" />
      </Link>

      <nav>
        <ul className="text-richblack-100 flex gap-x-6">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/demands">Demands</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>

      {/* Authentication Buttons */}
      <div className="flex items-center gap-x-4">
        {!isAuthenticated ? (
          <>
            <Link to="/login">
              <button className="bg-richblack-800 text-white py-2 px-4 rounded border border-richblack-700">
                Log in
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-richblack-800 text-white py-2 px-4 rounded border border-richblack-700">
                Sign up
              </button>
            </Link>
          </>
        ) : (
          <>
            {/* User Initial (Instead of Signup) */}
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
              {userInitial}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded border border-richblack-700"
            >
              Log Out
            </button>

            {/* Dashboard Button */}
            <Link to="/demands">
              <button className="bg-richblack-800 text-white py-2 px-4 rounded border border-richblack-700">
                Dashboard
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
