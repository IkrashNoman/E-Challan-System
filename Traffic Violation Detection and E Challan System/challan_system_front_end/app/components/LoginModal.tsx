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

  // Sign up fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeNumber, setBikeNumber] = useState("");
  const [bikeCopy, setBikeCopy] = useState<File | null>(null);
  const [cnicFront, setCnicFront] = useState<File | null>(null);
  const [cnicBack, setCnicBack] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !loginPassword) {
      toast.error("Please enter both login id and password");
      return;
    }

    // Do your login logic here
    console.log("Login:", loginId, loginPassword);

    // Optionally, show a success toast
    toast.success("Logged in successfully");
    closeModal();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordStrength === "Very Weak" || passwordStrength === "Weak") {
      toast.error("Password strength must be at least ‘Normal’");
      return;
    }
    if (password !== rePassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!bikeCopy || !cnicFront || !cnicBack) {
      toast.error("Please upload all required documents");
      return;
    }

    // Do your signup logic here
    console.log("SignUp data:", { email, phone, bikeNumber, bikeCopy, cnicFront, cnicBack, password });

    toast.success("Account created successfully");
    // maybe automatically switch to login or close
    setIsSignUp(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-surface rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto overflow-x-hidden
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
            <h2 className="text-xl font-semibold mb-4 text-text text-center">Login</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-text-secondary block mb-1">Email / Name / Bike Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <div className="text-right text-sm mt-1 text-primary cursor-pointer">Forgot Password?</div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-md font-semibold"
              >
                Sign In
              </button>
            </form>
            <p className="mt-4 text-sm text-text-secondary text-center">
              Do not have an account?{" "}
              <span
                className="text-primary cursor-pointer"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-text text-center">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-text-secondary block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Bike Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={bikeNumber}
                  onChange={(e) => setBikeNumber(e.target.value)}
                  pattern="^[A-Za-z]{1,3}[0-9]{1,4}$"
                  title="Format: 1-3 letters followed by 1-4 digits"
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Bike Official Copy</label>
                <input
                  type="file"
                  onChange={(e) => setBikeCopy(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">CNIC Front</label>
                <input
                  type="file"
                  onChange={(e) => setCnicFront(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">CNIC Back</label>
                <input
                  type="file"
                  onChange={(e) => setCnicBack(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className={`h-1 w-full mt-1 rounded ${getStrengthColor()}`}></div>
                <div className="text-sm text-text-secondary mt-1">{passwordStrength}</div>
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Re-enter Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-text-secondary">
                By signing up, you accept the{" "}
                <span className="text-primary cursor-pointer">Terms and Conditions</span>
              </p>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-md font-semibold"
              >
                Sign Up
              </button>
              <p className="mt-2 text-sm text-text-secondary text-center">
                Already have an account?{" "}
                <span className="text-primary cursor-pointer" onClick={() => setIsSignUp(false)}>
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
