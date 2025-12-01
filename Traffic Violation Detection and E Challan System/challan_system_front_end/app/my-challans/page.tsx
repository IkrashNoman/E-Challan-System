/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link"; // For Login Button
import Header from "@/app/components/Header";
import NavBar from "@/app/components/NavBar";
import { toast } from "react-toastify";
import LoginModal from "@/app/components/LoginModal"; // Import your existing LoginModal

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

interface Challan {
  id: number;
  bike_number: string;
  rule_name: string;
  amount_charged: number;
  status: "Paid" | "Unpaid" | "Cancelled" | "UnderAppeal";
  challan_date: string;
  due_date: string;
}

export default function MyChallans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Controls the main Login Modal visibility
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modal States for Actions
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);

  // Form States
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [appealEvidence, setAppealEvidence] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CHECK AUTH & FETCH DATA ---
  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = () => {
    // Ensure we are using the correct key "accessToken" from LoginModal
    const token = localStorage.getItem("accessToken"); 
    
    if (token) {
      setIsLoggedIn(true);
      fetchMyChallans(token);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  const fetchMyChallans = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/challan/my-challans/`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setChallans(data);
      } else {
        if(res.status === 401) {
            // Token expired or invalid -> Force Logout
            console.warn("Session expired. Logging out.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userEmail");
            setIsLoggedIn(false);
            setChallans([]);
        } else {
            console.error("Failed to fetch records");
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handlePayClick = (challan: Challan) => {
    setSelectedChallan(challan);
    setPaymentImage(null);
    setPayModalOpen(true);
  };

  const handleAppealClick = (challan: Challan) => {
    setSelectedChallan(challan);
    setAppealReason("");
    setAppealEvidence(null);
    setAppealModalOpen(true);
  };

  const submitPayment = async () => {
    if (!selectedChallan || !paymentImage) {
        toast.error("Please upload proof.");
        return;
    }
    
    const formData = new FormData();
    formData.append("payment_proof", paymentImage); 

    try {
        const res = await fetch(`${API_BASE}/api/challan/public/pay/${selectedChallan.id}/`, {
            method: "POST",
            body: formData, 
        });
        if (res.ok) {
            toast.success("Proof submitted!");
            setPayModalOpen(false);
            const token = localStorage.getItem("accessToken");
            if(token) fetchMyChallans(token);
        } else {
            const d = await res.json();
            toast.error(d.message || d.error || "Failed");
        }
    } catch (e) { toast.error("Network error"); }
  };

  const submitAppeal = async () => {
    if (!selectedChallan) return;
    if (!appealReason.trim()) {
        toast.error("Please provide a reason.");
        return;
    }

    const formData = new FormData();
    formData.append("challan", selectedChallan.id.toString());
    formData.append("reason", appealReason);
    if (appealEvidence) formData.append("evidence_url", appealEvidence);

    const token = localStorage.getItem("accessToken"); 
    const headers: Record<string, string> = {};
    if(token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}/api/challan/appeal/create/`, {
            method: "POST",
            headers: headers, 
            body: formData,
        });
        
        const data = await res.json();

        if (res.ok) {
            toast.success("Appeal submitted!");
            setAppealModalOpen(false);
            if(token) fetchMyChallans(token);
        } else {
            toast.error(data.error || "Failed");
        }
    } catch (e) { toast.error("Network error"); }
  };

  return (
    <>
      <Header />
      <NavBar />

      {/* RENDER LOGIN MODAL IF REQUESTED */}
      {showLoginModal && (
        <LoginModal 
            closeModal={() => {
                setShowLoginModal(false);
                // Re-check auth after modal closes (in case user logged in)
                checkAuthAndFetch();
            }} 
        />
      )}

      <div className="min-h-screen p-6 font-body bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
            
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold font-heading text-[var(--text)]">
                    Your Challans
                </h1>
                <p className="mt-2 text-[var(--text-secondary)]">
                    {isLoggedIn ? `Found ${challans.length} record(s)` : "Login to view your history"}
                </p>
            </div>

            {/* --- NOT LOGGED IN STATE --- */}
            {!isLoggedIn ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-xl shadow-sm border bg-[var(--surface)] border-[var(--accent)]">
                    <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mb-6 shadow-inner border border-[var(--accent)]">
                        {/* Lock Icon */}
                        <svg className="w-10 h-10 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 font-heading text-[var(--text)]">Access Restricted</h2>
                    <p className="mb-8 text-center max-w-md text-[var(--text-secondary)]">
                        Please login to your citizen account to view your traffic violation history and manage appeals.
                    </p>
                    
                    {/* Opens the Login Modal */}
                    <button 
                        onClick={() => setShowLoginModal(true)}
                        className="font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-md bg-[var(--brand)] text-[var(--text)] hover:bg-[var(--primary)]"
                    >
                        Login to Account
                    </button>
                </div>
            ) : (
                /* --- LOGGED IN CONTENT --- */
                <>
                    {loading ? (
                        <div className="text-center py-20 text-[var(--text-secondary)]">Loading records...</div>
                    ) : challans.length === 0 ? (
                        <div className="text-center py-20 rounded-lg shadow-sm border bg-[var(--surface)] border-[var(--accent)]">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--background)] flex items-center justify-center border border-[var(--accent)]">
                                <span className="text-3xl">🎉</span>
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--text)]">Clean Record!</h3>
                            <p className="text-[var(--text-secondary)]">You have no traffic violations associated with your account.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {challans.map((challan) => (
                                <div key={challan.id} className="rounded-xl shadow-sm border overflow-hidden relative transition-shadow hover:shadow-md bg-[var(--surface)] border-[var(--accent)]">
                                    
                                    {/* Status Badge */}
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                                        ${challan.status === 'Paid' 
                                            ? 'bg-[var(--brand)] text-[var(--text)] border-[var(--brand)]' 
                                            : challan.status === 'Unpaid' 
                                                ? 'bg-[var(--background)] text-[var(--text-secondary)] border-[var(--primary)]' 
                                                : 'bg-[var(--secondary)] text-[var(--text)] border-[var(--secondary)]'
                                        }
                                    `}>
                                        {challan.status}
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-bold mb-1 font-heading text-[var(--text)]">{challan.rule_name}</h3>
                                        <p className="text-sm mb-4 text-[var(--text-secondary)]">
                                            {challan.bike_number} <span className="opacity-50">|</span> #{challan.id}
                                        </p>
                                        
                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--text-secondary)]">Fine Amount:</span>
                                                <span className="font-bold text-[var(--brand)]">Rs {challan.amount_charged}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--text-secondary)]">Date:</span>
                                                <span className="text-[var(--text)]">{new Date(challan.challan_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--text-secondary)]">Due Date:</span>
                                                <span className="font-medium text-[var(--text)]">{challan.due_date}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {challan.status === 'Unpaid' ? (
                                                <button 
                                                    onClick={() => handlePayClick(challan)}
                                                    className="py-2 rounded-lg font-medium transition-colors shadow-sm bg-[var(--primary)] text-[var(--text)] hover:bg-[var(--brand)]"
                                                >
                                                    Pay Now
                                                </button>
                                            ) : (
                                                <button disabled className="border py-2 rounded-lg font-medium cursor-not-allowed opacity-60 bg-[var(--background)] border-[var(--accent)] text-[var(--text-secondary)]">
                                                    Paid
                                                </button>
                                            )}

                                            {challan.status !== 'UnderAppeal' && challan.status !== 'Cancelled' ? (
                                                <button 
                                                    onClick={() => handleAppealClick(challan)}
                                                    className="border py-2 rounded-lg font-medium transition-colors border-[var(--primary)] text-[var(--text)] hover:bg-[var(--background)]"
                                                >
                                                    Appeal
                                                </button>
                                            ) : (
                                                <button disabled className="border py-2 rounded-lg font-medium cursor-not-allowed opacity-60 bg-[var(--background)] border-[var(--accent)] text-[var(--text-secondary)]">
                                                    {challan.status === 'Cancelled' ? 'Cancelled' : 'Appealed'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>

        {/* --- PAY MODAL --- */}
        {payModalOpen && selectedChallan && (
            <div className="fixed inset-0 bg-[var(--text-secondary)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="rounded-xl shadow-2xl w-full max-w-md p-6 border bg-[var(--surface)] border-[var(--accent)]">
                    <h2 className="text-2xl font-bold mb-2 font-heading text-[var(--text)]">Verify Payment</h2>
                    <p className="text-sm mb-6 text-[var(--text-secondary)]">
                        Upload receipt for Challan #{selectedChallan.id}
                    </p>

                    <div className="border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors cursor-pointer border-[var(--secondary)] hover:border-[var(--brand)] bg-[var(--background)]"
                         onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => setPaymentImage(e.target.files?.[0] || null)}
                        />
                        {paymentImage ? (
                            <div className="font-medium text-[var(--brand)]">
                                {paymentImage.name}
                            </div>
                        ) : (
                            <div className="text-[var(--text-secondary)]">
                                <p className="mb-1">Click to upload image</p>
                                <span className="text-xs">JPG, PNG supported</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setPayModalOpen(false)} className="flex-1 py-2 font-medium rounded-lg transition-colors text-[var(--text)] border border-[var(--accent)] hover:bg-[var(--background)]">Cancel</button>
                        <button onClick={submitPayment} className="flex-1 py-2 font-medium rounded-lg shadow-md transition-colors bg-[var(--brand)] text-[var(--text)] hover:bg-[var(--primary)]">
                            Submit Proof
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- APPEAL MODAL --- */}
        {appealModalOpen && selectedChallan && (
            <div className="fixed inset-0 bg-[var(--text-secondary)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="rounded-xl shadow-2xl w-full max-w-lg p-6 border bg-[var(--surface)] border-[var(--accent)]">
                    <h2 className="text-2xl font-bold mb-2 font-heading text-[var(--text)]">Raise Appeal</h2>
                    <p className="text-sm mb-6 text-[var(--text-secondary)]">
                        Why do you want to challenge Challan #{selectedChallan.id}?
                    </p>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-[var(--text)]">Reason</label>
                            <textarea 
                                className="w-full p-3 border rounded-lg outline-none border-[var(--accent)] bg-[var(--background)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]"
                                rows={4}
                                placeholder="Describe why this challan is incorrect..."
                                value={appealReason}
                                onChange={(e) => setAppealReason(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-[var(--text)]">Evidence (Optional)</label>
                            <input 
                                type="file" 
                                className="w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)] file:text-[var(--text)] hover:file:bg-[var(--brand)]"
                                onChange={(e) => setAppealEvidence(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setAppealModalOpen(false)} className="flex-1 py-2 font-medium rounded-lg transition-colors text-[var(--text)] border border-[var(--accent)] hover:bg-[var(--background)]">Cancel</button>
                        <button onClick={submitAppeal} className="flex-1 py-2 font-medium rounded-lg shadow-md transition-colors bg-[var(--brand)] text-[var(--text)] hover:bg-[var(--primary)]">
                            Submit Appeal
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </>
  );
}