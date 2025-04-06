import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SignupForm = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    panNumber: "",
    GSTNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("Appealer");
  const [donorType, setDonorType] = useState("");

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (role === "Donor") {
      if (!donorType) {
        toast.error("Please select Donor Type");
        return;
      }

      if (donorType === "person" && !formData.panNumber.trim()) {
        toast.error("PAN Number is required for Donor - Person");
        return;
      }

      if (donorType === "organization") {
        if (!formData.panNumber.trim() || !formData.GSTNumber.trim()) {
          toast.error(
            "PAN and GST Number are required for Donor - Organization"
          );
          return;
        }
      }
    }

    const finalData = {
      fname: formData.fname,
      lname: formData.lname,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role,
      ...(role === "Donor" && {
        donorType,
        panNumber: formData.panNumber,
        ...(donorType === "organization" && {
          GSTNumber: formData.GSTNumber,
        }),
      }),
    };

    try {
      const response = await fetch("http://localhost:4000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account Created Successfully");
        setIsLoggedIn(true);
        navigate("/demands");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Signup error:", error);
    }
  };

  return (
    <div>
      {/* User Role Tabs */}
      <div className="flex bg-richblack-800 p-1 gap-x-1 my-6 rounded-full max-w-max">
        <button
          className={`$
            {role === "Appealer"
              ? "bg-richblack-900 text-richblack-5"
              : "bg-transparent text-richblack-200"}
            py-2 px-5 rounded-full`}
          onClick={() => {
            setRole("Appealer");
            setDonorType("");
          }}
        >
          Appealer
        </button>
        <button
          className={`$
            {role === "Donor"
              ? "bg-richblack-900 text-richblack-5"
              : "bg-transparent text-richblack-200"}
            py-2 px-5 rounded-full`}
          onClick={() => setRole("Donor")}
        >
          Donor
        </button>
      </div>

      {/* Donor Type */}
      {role === "Donor" && (
        <div className="flex gap-4 mb-4 ml-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="person"
              checked={donorType === "person"}
              onChange={() => setDonorType("person")}
            />
            <span className="text-richblack-200">Person</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="organization"
              checked={donorType === "organization"}
              onChange={() => setDonorType("organization")}
            />
            <span className="text-richblack-200">Organization</span>
          </label>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={submitHandler}>
        <div className="flex gap-4">
          <label className="w-full">
            <p className="text-richblack-5 mb-1">First Name</p>
            <input
              required
              type="text"
              name="fname"
              value={formData.fname}
              onChange={changeHandler}
              className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
              placeholder="Enter first name"
            />
          </label>

          <label className="w-full">
            <p className="text-richblack-5 mb-1">Last Name</p>
            <input
              required
              type="text"
              name="lname"
              value={formData.lname}
              onChange={changeHandler}
              className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
              placeholder="Enter last name"
            />
          </label>
        </div>

        <label className="block mt-4">
          <p className="text-richblack-5 mb-1">Email Address</p>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={changeHandler}
            className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
            placeholder="Enter email"
          />
        </label>

        <label className="block mt-4">
          <p className="text-richblack-5 mb-1">Phone Number</p>
          <input
            required
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={changeHandler}
            className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
            placeholder="Enter phone number"
          />
        </label>

        {/* Donor Fields */}
        {role === "Donor" && (
          <>
            <label className="block mt-4">
              <p className="text-richblack-5 mb-1">PAN Number</p>
              <input
                required={
                  donorType === "person" || donorType === "organization"
                }
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={changeHandler}
                className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
                placeholder="Enter PAN number"
              />
            </label>

            {donorType === "organization" && (
              <label className="block mt-4">
                <p className="text-richblack-5 mb-1">GST Number</p>
                <input
                  required
                  type="text"
                  name="GSTNumber"
                  value={formData.GSTNumber}
                  onChange={changeHandler}
                  className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
                  placeholder="Enter GST number"
                />
              </label>
            )}
          </>
        )}

        <div className="flex gap-4 mt-4">
          <label className="w-full relative">
            <p className="text-richblack-5 mb-1">Password</p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={changeHandler}
              className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
              placeholder="Enter password"
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-richblack-200 text-sm"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </label>

          <label className="w-full relative">
            <p className="text-richblack-5 mb-1">Confirm Password</p>
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={changeHandler}
              className="w-full p-2 rounded bg-richblack-700 text-richblack-5"
              placeholder="Confirm password"
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-richblack-200 text-sm"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-50 rounded-md font-medium text-richblack-900 px-4 py-2 mt-6"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
