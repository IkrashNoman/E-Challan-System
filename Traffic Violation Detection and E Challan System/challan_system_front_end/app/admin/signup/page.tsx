/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Security / Captcha State
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [tries, setTries] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  function generateCaptcha() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCaptcha(code);
  }

  useEffect(() => {
    generateCaptcha();
    // Check if already logged in?
    const token = localStorage.getItem("officerToken");
    if (token) {
        // Optional: validate token or redirect
        // router.push("/admin/add-other"); 
    }
  }, []);

  // Cooldown Timer
  useEffect(() => {
    if (!cooldownEnd) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remainingTime = cooldownEnd.getTime() - now.getTime();

      if (remainingTime <= 0) {
        clearInterval(interval);
        setCooldownEnd(null); 
        setTimeLeft(null); 
      } else {
        setTimeLeft(Math.ceil(remainingTime / 1000)); 
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEnd]);

  function checkCooldown() {
    return cooldownEnd ? new Date().getTime() < cooldownEnd.getTime() : false;
  }

  function applyCooldown() {
    if (tries < 3) return;

    let secondsToAdd = 0;
    if (tries === 3) secondsToAdd = 30; // 30s
    else if (tries === 6) secondsToAdd = 300; // 5m
    else if (tries >= 9) secondsToAdd = 3600; // 1h

    const next = new Date();
    next.setSeconds(next.getSeconds() + secondsToAdd);
    setCooldownEnd(next);
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleLogin = async () => {
    if (checkCooldown()) {
      toast.error(`Cooldown active. Wait ${formatTime(timeLeft || 0)}`);
      return;
    }

    if (captchaInput !== captcha) {
      toast.error("Invalid captcha");
      generateCaptcha();
      return;
    }

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      // Connect to Backend Login Endpoint
      const response = await fetch(`${API_BASE}/api/officer/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login Successful");
        
        // Store Tokens
        localStorage.setItem("officerToken", data.tokens.access);
        localStorage.setItem("officerRefreshToken", data.tokens.refresh);
        localStorage.setItem("officerName", data.name);
        localStorage.setItem("officerRank", data.rank);

        // Redirect
        router.push("/admin/add-other"); 
      } else {
        // Failed Login
        const newTry = tries + 1;
        setTries(newTry);
        applyCooldown();
        toast.error(data.error || "Invalid credentials");
        generateCaptcha();
      }
    } catch (error) {
      toast.error("Network error. Backend not reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 shadow-lg rounded-xl w-full max-w-sm border border-gray-200">
        <div className="text-center mb-6">
            <img src="/images/police-logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-2" onError={(e) => e.currentTarget.style.display = 'none'} /> 
            <h1 className="text-2xl font-bold text-gray-800">Officer Portal</h1>
            <p className="text-gray-500 text-sm">Traffic Violation System</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block mb-1 font-semibold text-gray-700 text-sm">Email</label>
                <input
                type="email"
                className="border w-full p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@police.gov.pk"
                />
            </div>

            <div>
                <label className="block mb-1 font-semibold text-gray-700 text-sm">Password</label>
                <input
                type="password"
                className="border w-full p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                />
            </div>

            {/* Captcha Section */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="block mb-1 font-semibold text-gray-700 text-sm">Security Check</label>
                <div className="flex items-center justify-between mb-2">
                    <div 
                        className="font-mono font-bold text-xl tracking-widest text-gray-600 bg-gray-200 px-4 py-1 rounded select-none"
                        style={{backgroundImage: 'url(/images/noise.png)', opacity: 0.8}} 
                    >
                        {captcha}
                    </div>
                    <button 
                        onClick={generateCaptcha} 
                        className="text-blue-600 text-xs hover:underline"
                    >
                        Regenerate
                    </button>
                </div>
                <input
                    type="text"
                    className="border w-full p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none text-center uppercase"
                    placeholder="Enter code above"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                />
            </div>

            <button
                onClick={handleLogin}
                disabled={loading || (checkCooldown() && timeLeft !== null)}
                className={`w-full text-white font-bold py-2.5 rounded-lg transition-all shadow-md 
                    ${loading || checkCooldown() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 hover:shadow-lg transform active:scale-95'}
                `}
            >
                {loading ? "Verifying..." : "Secure Login"}
            </button>
        </div>

        {checkCooldown() && timeLeft !== null && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-center text-sm">
            <p className="font-bold">Too many attempts</p>
            <p>Please wait: {formatTime(timeLeft)}</p>
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-400">
            <p>Restricted Access • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}