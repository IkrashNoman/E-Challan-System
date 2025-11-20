'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

export default function AdminLogin() {
  // This is only the UI + basic front-end logic.
  // Note: Real security must be implemented in backend.

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [tries, setTries] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // State to store remaining time

  function generateCaptcha() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCaptcha(code);
  }

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Update cooldown timer every second
  useEffect(() => {
    if (!cooldownEnd) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remainingTime = cooldownEnd.getTime() - now.getTime();

      if (remainingTime <= 0) {
        clearInterval(interval);
        setCooldownEnd(null); // Reset cooldown
        setTimeLeft(null); // Clear time left
      } else {
        setTimeLeft(Math.ceil(remainingTime / 1000)); // Convert to seconds
      }
    }, 1000);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [cooldownEnd]);

  function checkCooldown() {
    return cooldownEnd ? new Date().getTime() < cooldownEnd.getTime() : false;
  }

  function applyCooldown() {
    if (tries < 3) return;

    let hours = 0;
    if (tries === 3) hours = 1;
    else if (tries === 6) hours = 5;
    else if (tries === 9) hours = 24;
    else hours = 240; // ~10 days

    const next = new Date();
    next.setHours(next.getHours() + hours);
    setCooldownEnd(next);
  }

  function handleLogin() {
    if (checkCooldown()) {
      alert("You are in cooldown period. Try later.");
      return;
    }

    if (captchaInput !== captcha) {
      alert("Invalid captcha");
      generateCaptcha();
      return;
    }

    if (username === "Traffic" && password === "Police") {
      window.location.href = "/admin/challan";
    } else {
      const newTry = tries + 1;
      setTries(newTry);
      applyCooldown();
      alert("Invalid credentials. Attempt: " + newTry);
      generateCaptcha();
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 shadow-md rounded-xl w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Admin Login</h1>

        <label className="block mb-1 font-semibold">Username</label>
        <input
          type="text"
          className="border w-full p-2 rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block mb-1 font-semibold">Password</label>
        <input
          type="password"
          className="border w-full p-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block mb-1 font-semibold">Captcha</label>
        <div className="flex items-center gap-2 mb-3">
          <div className="font-mono font-bold p-2 bg-gray-200 rounded">{captcha}</div>
          <button onClick={generateCaptcha} className="text-blue-600 text-sm underline">Refresh</button>
        </div>

        <input
          type="text"
          className="border w-full p-2 rounded mb-4"
          placeholder="Enter captcha"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded mt-2 hover:bg-blue-700"
        >
          Login
        </button>

        {checkCooldown() && timeLeft !== null && (
          <div className="mt-4 text-red-600 text-center">
            <p>Cooldown in effect. Please wait: {formatTime(timeLeft)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
