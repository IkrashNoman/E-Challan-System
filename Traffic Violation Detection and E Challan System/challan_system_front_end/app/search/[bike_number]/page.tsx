/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, notFound } from "next/navigation"; 
import Header from "@/app/components/Header";
import NavBar from "@/app/components/NavBar";
import { toast } from "react-toastify";

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

export default function SearchFunctionality() {
  const params = useParams();
  const rawBikeNumber = params?.bike_number as string;
  const bikeNumber = rawBikeNumber ? decodeURIComponent(rawBikeNumber) : null;

  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isNotFound, setIsNotFound] = useState(false);

  // Modal States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);

  // Form States
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [appealEvidence, setAppealEvidence] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isNotFound) {
    notFound(); 
  }

  // --- FETCH DATA ---
  const fetchChallans = async () => {
    if (!bikeNumber || bikeNumber === "undefined") return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/challan/public/search/?bike_number=${bikeNumber}`);
      
      if (res.status === 404) {
        setIsNotFound(true);
        return; 
      }

      if (res.ok) {
        const data = await res.json();
        setChallans(data);
      } else {
        setChallans([]); 
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bikeNumber) fetchChallans();
  }, [bikeNumber]);

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
            fetchChallans();
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

    const token = typeof window !== 'undefined' ? localStorage.getItem("officerToken") : null; 
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
            fetchChallans();
        } else {
            toast.error(data.error || "Failed");
        }
    } catch (e) { toast.error("Network error"); }
  };

  // --- STYLES HELPER (Using Global CSS Variables) ---
  // Using arbitrary values [color:var(--name)] to strictly adhere to global.css
  
  return (
    <>
      <Header />
      <NavBar />

      <div className="bg-background min-h-screen p-6 font-body">
        <div className="max-w-5xl mx-auto">
            
            {/* Page Title */}
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold text-text font-heading">
                    Search Results for <span className="text-brand">"{bikeNumber}"</span>
                </h1>
                <p className="text-text-secondary mt-2">Found {challans.length} record(s)</p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-20 text-text-secondary">Searching database...</div>
            ) : challans.length === 0 ? (
                <div className="text-center py-20 bg-surface rounded-lg shadow-sm border border-[var(--accent)]">
                    {/* Using a generic placeholder icon structure since we can't use external colors */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
                       <span className="text-3xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold text-text">No Challans Found</h3>
                    <p className="text-text-secondary">Good news! No violations found for this vehicle.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challans.map((challan) => (
                        <div key={challan.id} className="bg-surface rounded-xl shadow-sm border border-[var(--accent)] overflow-hidden hover:shadow-md transition-shadow relative">
                            
                            {/* Status Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                                ${challan.status === 'Paid' 
                                    ? 'bg-brand text-text border-brand'  // Paid = Brand Color
                                    : challan.status === 'Unpaid' 
                                        ? 'bg-background text-text-secondary border-[var(--primary)]' // Unpaid = Lighter
                                        : 'bg-secondary text-text border-secondary' // Other
                                }
                            `}>
                                {challan.status}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-text mb-1 font-heading">{challan.rule_name}</h3>
                                <p className="text-text-secondary text-sm mb-4">ID: #{challan.id}</p>
                                
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Fine Amount:</span>
                                        <span className="font-bold text-brand">Rs {challan.amount_charged}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Issue Date:</span>
                                        <span className="text-text">{new Date(challan.challan_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Due Date:</span>
                                        {/* Using primary/brand color for emphasis instead of red */}
                                        <span className="text-text font-medium">{challan.due_date}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3">
                                    {challan.status === 'Unpaid' ? (
                                        <button 
                                            onClick={() => handlePayClick(challan)}
                                            className="bg-primary text-text py-2 rounded-lg font-medium hover:bg-brand transition-colors shadow-sm"
                                        >
                                            Pay Now
                                        </button>
                                    ) : (
                                        <button disabled className="bg-background border border-[var(--accent)] text-text-secondary py-2 rounded-lg font-medium cursor-not-allowed opacity-60">
                                            Paid
                                        </button>
                                    )}

                                    {challan.status !== 'UnderAppeal' && challan.status !== 'Cancelled' ? (
                                        <button 
                                            onClick={() => handleAppealClick(challan)}
                                            className="border border-[var(--primary)] text-text py-2 rounded-lg font-medium hover:bg-background transition-colors"
                                        >
                                            Appeal
                                        </button>
                                    ) : (
                                        <button disabled className="bg-background border border-[var(--accent)] text-text-secondary py-2 rounded-lg font-medium cursor-not-allowed opacity-60">
                                            {challan.status === 'Cancelled' ? 'Cancelled' : 'Appealed'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* --- PAY MODAL --- */}
        {payModalOpen && selectedChallan && (
            <div className="fixed inset-0 bg-[var(--text-secondary)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md p-6 border border-[var(--accent)]">
                    <h2 className="text-2xl font-bold mb-2 text-text font-heading">Verify Payment</h2>
                    <p className="text-text-secondary text-sm mb-6">
                        Upload a screenshot or photo of your payment receipt for Challan #{selectedChallan.id}.
                    </p>

                    <div className="border-2 border-dashed border-[var(--secondary)] rounded-lg p-8 text-center mb-6 hover:border-brand transition-colors cursor-pointer bg-background"
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
                            <div className="text-brand font-medium">
                                {paymentImage.name}
                            </div>
                        ) : (
                            <div className="text-text-secondary">
                                <p className="mb-1">Click to upload image</p>
                                <span className="text-xs">JPG, PNG supported</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setPayModalOpen(false)} className="flex-1 py-2 text-text border border-[var(--accent)] font-medium hover:bg-background rounded-lg transition-colors">Cancel</button>
                        <button onClick={submitPayment} className="flex-1 py-2 bg-brand text-text font-medium rounded-lg hover:bg-primary shadow-md transition-colors">
                            Submit Proof
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- APPEAL MODAL --- */}
        {appealModalOpen && selectedChallan && (
            <div className="fixed inset-0 bg-[var(--text-secondary)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg p-6 border border-[var(--accent)]">
                    <h2 className="text-2xl font-bold mb-2 text-text font-heading">Raise an Appeal</h2>
                    <p className="text-text-secondary text-sm mb-6">
                        Why do you want to challenge Challan #{selectedChallan.id}?
                    </p>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-text mb-1">Reason</label>
                            <textarea 
                                className="w-full p-3 border border-[var(--accent)] rounded-lg bg-background text-text focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                rows={4}
                                placeholder="Describe why this challan is incorrect..."
                                value={appealReason}
                                onChange={(e) => setAppealReason(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text mb-1">Evidence (Optional)</label>
                            <input 
                                type="file" 
                                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-text hover:file:bg-brand"
                                onChange={(e) => setAppealEvidence(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setAppealModalOpen(false)} className="flex-1 py-2 text-text border border-[var(--accent)] font-medium hover:bg-background rounded-lg transition-colors">Cancel</button>
                        <button onClick={submitAppeal} className="flex-1 py-2 bg-brand text-text font-medium rounded-lg hover:bg-primary shadow-md transition-colors">
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