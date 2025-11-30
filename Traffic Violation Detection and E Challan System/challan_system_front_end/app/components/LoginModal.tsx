/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface LoginModalProps {
  closeModal: () => void;
}

export default function LoginModal({ closeModal }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  // Login fields
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign up fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeNumber, setBikeNumber] = useState("");
  
  // --- NEW FIELDS ---
  const [cnic, setCnic] = useState("");
  const [bikeRegDate, setBikeRegDate] = useState("");
  // ------------------

  const [bikeCopy, setBikeCopy] = useState<File | null>(null);
  const [cnicFront, setCnicFront] = useState<File | null>(null);
  const [cnicBack, setCnicBack] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  // Helper to get Base URL from env
  const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 8) score++;

    switch (score) {
      case 0:
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Normal";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "Very Weak":
        return "bg-red-600";
      case "Weak":
        return "bg-orange-500";
      case "Normal":
        return "bg-yellow-400";
      case "Strong":
        return "bg-green-500";
      case "Very Strong":
        return "bg-green-700";
      default:
        return "";
    }
  };

  // --- INTEGRATED LOGIN FUNCTION ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !loginPassword) {
      toast.error("Please enter both login id and password");
      return;
    }

    setLoading(true);

    try {
      // NOTE: Your backend LoginSerializer strictly expects 'email'.
      const response = await fetch(`${API_BASE}/api/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginId, 
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login Success
        console.log("Login Success:", data);
        
        // Save tokens to localStorage
        localStorage.setItem("accessToken", data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
        localStorage.setItem("userEmail", data.email);

        toast.success("Logged in successfully");
        closeModal();
      } else {
        // Login Failed
        toast.error(data.error || "Login failed. Check credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  // --- INTEGRATED SIGNUP FUNCTION ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordStrength === "Very Weak" || passwordStrength === "Weak") {
      toast.error("Password strength must be at least ‘Normal’");
      return;
    }
    if (password !== rePassword) {
      toast.error("Passwords do not match");
      return;
    }
    // Validation: Ensure files are selected
    if (!bikeCopy || !cnicFront || !cnicBack) {
      toast.error("Please upload all required documents");
      return;
    }
    // Validation: Ensure new fields are filled
    if (!cnic || !bikeRegDate) {
      toast.error("Please fill in CNIC and Bike Registration Date");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email,
        phone: phone,
        password: password,
        confirm_password: rePassword,
        bike_number: bikeNumber,
        
        // --- NEW FIELDS ---
        cnic: cnic,
        bike_registration_date: bikeRegDate,
        // ------------------

        // Sending filenames as placeholders (Backend expects Strings for now)
        official_copy_url: bikeCopy.name, 
        cnic_front_url: cnicFront.name,
        cnic_back_url: cnicBack.name
      };

      const response = await fetch(`${API_BASE}/api/users/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully! Please login.");
        setIsSignUp(false); // Switch to login view
      } else {
        // Handle Validation Errors
        const errorMsg = Object.values(data).flat().join(", ") || "Signup failed";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-surface bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto overflow-x-hidden
        ${isSignUp ? "h-[75vh]" : "h-[55vh]"} sm:h-auto sm:max-h-[80vh]`}
      >
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-text font-bold text-2xl"
        >
          ×
        </button>

        {!isSignUp ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-text text-center text-black">Login</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Email</label>
                <input
                  type="text"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <div className="text-right text-sm mt-1 text-primary cursor-pointer text-blue-600">Forgot Password?</div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
            <p className="mt-4 text-sm text-text-secondary text-center text-gray-600">
              Do not have an account?{" "}
              <span
                className="text-primary cursor-pointer text-blue-600 font-medium"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-text text-center text-black">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* --- NEW INPUT: CNIC --- */}
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">CNIC (e.g. 12345-1234567-1)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  required
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              {/* --- NEW INPUT: BIKE REG DATE --- */}
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Bike Registration Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={bikeRegDate}
                  onChange={(e) => setBikeRegDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Bike Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={bikeNumber}
                  onChange={(e) => setBikeNumber(e.target.value)}
                  // Regex pattern kept as requested
                  pattern="^[A-Za-z]{1,3}[0-9]{1,4}$"
                  title="Format: 1-3 letters followed by 1-4 digits"
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Bike Official Copy</label>
                <input
                  type="file"
                  className="text-gray-600"
                  onChange={(e) => setBikeCopy(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">CNIC Front</label>
                <input
                  type="file"
                  className="text-gray-600"
                  onChange={(e) => setCnicFront(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">CNIC Back</label>
                <input
                  type="file"
                  className="text-gray-600"
                  onChange={(e) => setCnicBack(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className={`h-1 w-full mt-1 rounded ${getStrengthColor()}`}></div>
                <div className="text-sm text-text-secondary mt-1 text-gray-600">{passwordStrength}</div>
              </div>
              <div>
                <label className="text-text-secondary block mb-1 text-gray-600">Re-enter Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-text-secondary text-gray-600">
                By signing up, you accept the{" "}
                <span className="text-primary cursor-pointer text-blue-600">Terms and Conditions</span>
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
              <p className="mt-2 text-sm text-text-secondary text-center text-gray-600">
                Already have an account?{" "}
                <span className="text-primary cursor-pointer text-blue-600 font-medium" onClick={() => setIsSignUp(false)}>
                  Login
                </span>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}