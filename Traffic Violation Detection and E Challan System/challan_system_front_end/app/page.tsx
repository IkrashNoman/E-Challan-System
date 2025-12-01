/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import NavBar from "@/app/components/NavBar"; // Assuming you have a public/common NavBar
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check Session on Mount
  useEffect(() => {
    const token = localStorage.getItem("officerToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // --- LOGIN LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter credentials.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/officer/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save Tokens
        localStorage.setItem("officerToken", data.tokens.access);
        localStorage.setItem("officerRefreshToken", data.tokens.refresh);
        localStorage.setItem("officerName", data.name);
        localStorage.setItem("officerRank", data.rank);

        toast.success(`Welcome back, ${data.name}!`);
        setIsLoggedIn(true);
        setShowModal(false); // Close modal
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Network error. Backend unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <NavBar />

      <main className="min-h-screen bg-background text-text flex flex-col items-center p-6">
        
        {isLoggedIn ? (
          // --- VIEW B: LOGGED IN (TUTORIAL VIDEO) ---
          <div className="w-full max-w-5xl animate-fade-in mt-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-brand">
                Officer Dashboard Tutorial
              </h1>
              <p className="text-text-secondary text-lg">
                Watch this quick guide to learn how to issue challans and manage appeals.
              </p>
            </div>

            <div className="bg-surface border-4 border-[var(--accent)] rounded-2xl overflow-hidden shadow-xl aspect-video relative group cursor-pointer">
              {/* Placeholder for actual video source */}
              <video 
                className="w-full h-full object-cover" 
                controls
                poster="/images/video-poster.png" // Replace with a real image path if you have one
              >
                <source src="/videos/tutorial.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Fallback Overlay if no video source exists yet */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:bg-black/10 transition-colors">
                 {/* Play Button Icon */}
                 <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-lg opacity-80">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                 </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--secondary)]">
                    <h3 className="font-bold text-lg mb-2 text-primary">1. Issue Challan</h3>
                    <p className="text-sm text-text-secondary">Scan number plates or enter manually to issue fines instantly.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--secondary)]">
                    <h3 className="font-bold text-lg mb-2 text-primary">2. Manage Appeals</h3>
                    <p className="text-sm text-text-secondary">Review evidence submitted by citizens and approve or reject appeals.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--secondary)]">
                    <h3 className="font-bold text-lg mb-2 text-primary">3. Track Records</h3>
                    <p className="text-sm text-text-secondary">View history of violations and payment statuses in real-time.</p>
                </div>
            </div>
          </div>

        ) : (
          // --- VIEW A: NOT LOGGED IN ---
          <div className="flex flex-col items-center justify-center text-center mt-20 max-w-2xl">
            <div className="mb-6 bg-surface p-6 rounded-full inline-block shadow-inner">
                <img 
                    src="/images/police-logo.png" 
                    alt="Logo" 
                    className="w-24 h-24 object-contain opacity-90"
                    onError={(e) => e.currentTarget.style.display = 'none'} 
                />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-text">
              Traffic Violation System
            </h1>
            
            <p className="text-xl text-text-secondary mb-10 leading-relaxed">
              Authorized personnel must login to access the dashboard, issue challans, and manage traffic violations.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-brand text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
            >
              Login to Portal
            </button>
          </div>
        )}

        {/* --- LOGIN MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 bg-[var(--text-secondary)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-[var(--accent)]">
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold text-center mb-2 font-heading text-text">Officer Login</h2>
              <p className="text-center text-text-secondary text-sm mb-6">Enter your credentials to continue</p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-text mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                    placeholder="officer@police.gov.pk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full p-3 border border-[var(--secondary)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-primary text-white font-bold py-3 rounded-lg shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Access Dashboard"}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">Restricted Access • Official Use Only</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </>
  );
}