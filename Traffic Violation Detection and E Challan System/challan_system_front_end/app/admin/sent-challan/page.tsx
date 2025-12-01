/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import AdminNavBar from "../components/AdminNavBar";
import { toast } from "react-toastify";

// --- INTERFACES ---
interface BackendChallan {
  id: number;
  bike: number;
  bike_number?: string; 
  rule: number;
  rule_name?: string;   
  officer: number;
  area: number;
  challan_date: string;
  due_date: string;
  status: "Paid" | "Unpaid" | "Cancelled" | "UnderAppeal";
  amount_charged: string | number;
}

interface BackendAppeal {
  id: number;
  challan: number;
  reason: string;
  evidence_url: string | null;
  status: "Pending" | "Approved" | "Rejected";
  submitted_at: string;
}

interface ExtendedChallan extends BackendChallan {
  isOverdue: boolean;
  linkedAppeal?: BackendAppeal;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

export default function ChallanManagement() {
  const router = useRouter();

  // --- STATE ---
  // Mobile View Toggle: "appeals" or "all" (Only affects mobile visibility)
  const [mobileView, setMobileView] = useState<"appeals" | "all">("all");
  
  const [challans, setChallans] = useState<ExtendedChallan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedChallan, setSelectedChallan] = useState<ExtendedChallan | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<BackendAppeal | null>(null);
  const [editStatus, setEditStatus] = useState("");

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const sortRef = useRef<HTMLSelectElement>(null);

  // --- HELPER: Auth Headers ---
  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("officerToken") : null;
    if (!token) return null;
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    };
  };

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    const headers = getAuthHeaders();
    if (!headers) { router.push("/admin/signup"); return; }

    setLoading(true);
    try {
      const [challansRes, appealsRes] = await Promise.all([
        fetch(`${API_BASE}/api/challan/all/`, { headers }),
        fetch(`${API_BASE}/api/challan/appeal/all/`, { headers })
      ]);

      if (challansRes.status === 401) { 
          toast.error("Session expired");
          router.push("/admin/signup"); 
          return; 
      }

      const challansData: BackendChallan[] = await challansRes.json();
      const appealsData: BackendAppeal[] = await appealsRes.json();

      // Process Challans
      const processedChallans: ExtendedChallan[] = challansData.map(c => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const due = new Date(c.due_date);
        
        // Red Logic: Overdue AND Unpaid
        const isOverdue = due < today && c.status === "Unpaid";

        const relatedAppeal = appealsData.find((a: BackendAppeal) => a.challan === c.id);

        return {
          ...c,
          isOverdue,
          linkedAppeal: relatedAppeal
        };
      });

      setChallans(processedChallans);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. LOGIC: FILTER & SORT ---
  const getProcessedData = (dataset: ExtendedChallan[]) => {
    let data = [...dataset];

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(c => 
        c.id.toString().includes(s) || 
        (c.rule_name && c.rule_name.toLowerCase().includes(s)) ||
        (c.bike_number && c.bike_number.toLowerCase().includes(s))
      );
    }

    switch (sortOption) {
      case "amount-asc":
        data.sort((a, b) => Number(a.amount_charged) - Number(b.amount_charged));
        break;
      case "amount-desc":
        data.sort((a, b) => Number(b.amount_charged) - Number(a.amount_charged));
        break;
      case "date-asc":
        data.sort((a, b) => new Date(a.challan_date).getTime() - new Date(b.challan_date).getTime());
        break;
      case "date-desc":
        data.sort((a, b) => new Date(b.challan_date).getTime() - new Date(a.challan_date).getTime());
        break;
    }

    return data;
  };

  // Section 1 Data: Only Pending Appeals
  const appealsData = getProcessedData(challans.filter(c => c.linkedAppeal !== undefined && c.linkedAppeal.status === 'Pending'));
  
  // Section 2 Data: Everything
  const allChallansData = getProcessedData(challans);

  // --- 3. UPDATES ---
  const handleUpdateChallan = async () => {
    if (!selectedChallan) return;
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/api/challan/update/${selectedChallan.id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: editStatus })
      });

      if (res.ok) {
        toast.success("Challan Updated");
        setSelectedChallan(null);
        setSelectedAppeal(null);
        fetchData(); 
      } else {
        toast.error("Update Failed");
      }
    } catch (e) { toast.error("Network error"); }
  };

  const handleUpdateAppeal = async (newStatus: string) => {
    if (!selectedAppeal) return;
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE}/api/challan/appeal/update/${selectedAppeal.id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Appeal ${newStatus}`);
        setSelectedAppeal(null);
        setSelectedChallan(null);
        fetchData();
      } else {
        toast.error("Failed");
      }
    } catch (e) { toast.error("Network error"); }
  };

  // --- COMPONENT: Card Item ---
  const ChallanCard = ({ challan, isAppeal = false }: { challan: ExtendedChallan, isAppeal?: boolean }) => {
    let stripColor = "bg-gray-500";
    if (challan.status === "Paid") stripColor = "bg-green-500";
    else if (challan.status === "UnderAppeal") stripColor = "bg-yellow-500";
    else if (challan.status === "Unpaid") stripColor = "bg-red-500";

    // Red border/background if overdue
    const cardBorder = challan.isOverdue ? "border-red-500" : "border-gray-200";
    const cardBg = challan.isOverdue ? "bg-red-50" : "bg-surface";

    const handleClick = () => {
        if (isAppeal && challan.linkedAppeal) {
            setSelectedAppeal(challan.linkedAppeal);
            setSelectedChallan(challan);
            setEditStatus(challan.status);
        } else {
            setSelectedChallan(challan);
            setEditStatus(challan.status);
        }
    };

    return (
        <div
            className={`p-4 rounded border cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden ${cardBorder} ${cardBg}`}
            onClick={handleClick}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripColor}`}></div>
            <div className="pl-3">
                <div className="flex justify-between items-start">
                    {/* BIKE NUMBER AS TITLE */}
                    <h3 className="font-bold text-text text-xl">
                        {challan.bike_number || `Bike #${challan.bike}`}
                    </h3>
                    {challan.isOverdue && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 rounded">OVERDUE</span>}
                </div>
                
                {/* ID BELOW */}
                <p className="text-xs text-gray-400 font-mono mb-2">Challan #{challan.id}</p>

                <p className="font-medium text-gray-700 text-sm line-clamp-1">
                    {challan.rule_name || `Rule #${challan.rule}`}
                </p>
                <p className="text-primary font-bold mt-1">Rs {Number(challan.amount_charged).toLocaleString()}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(challan.challan_date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded font-medium ${
                        challan.status === "Paid" ? "bg-green-100 text-green-700" :
                        challan.status === "UnderAppeal" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                    }`}>
                        {challan.status}
                    </span>
                </div>
            </div>
        </div>
    );
  };

  return (
    <>
      <Header />
      <AdminNavBar />

      <div className="p-6 bg-background min-h-screen relative">
        
        {/* --- MOBILE HEADER & DROPDOWN --- */}
        <div className="md:hidden flex justify-between items-center mb-6 border-b pb-4 relative z-20">
          <h2 className="text-xl font-bold text-text">
            {mobileView === "all" ? "All Challans" : "Appeals"}
          </h2>
          <div className="relative">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <img
                src={mobileMenuOpen ? "/images/menu-close-icon.png" : "/images/dropdown-icon.png"}
                alt="Menu"
                className="w-8 h-8"
              />
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-surface border shadow-xl rounded-md overflow-hidden z-30">
                <button
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-100 ${mobileView === "all" ? "bg-gray-50 font-bold" : ""}`}
                  onClick={() => { setMobileView("all"); setMobileMenuOpen(false); }}
                >
                  All Challans
                </button>
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${mobileView === "appeals" ? "bg-gray-50 font-bold" : ""}`}
                  onClick={() => { setMobileView("appeals"); setMobileMenuOpen(false); }}
                >
                  Appeals
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- DESKTOP HEADER --- */}
        <div className="hidden md:block mb-4">
            <h2 className="text-2xl font-bold text-text">Challan Management</h2>
        </div>

        {/* --- SEARCH & SORT --- */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 mt-2">
            <div className="relative w-full md:w-1/2">
                <img src="/images/search-icon.png" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-70" alt="Search" />
                <input
                    type="text"
                    placeholder="Search by Bike No or Rule..."
                    className="pl-10 p-2 border rounded bg-surface w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="relative flex items-center justify-end md:ml-auto mr-2">
                <select
                    ref={sortRef}
                    className="absolute pointer-events-none opacity-0"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="">Default</option>
                    <option value="amount-asc">Amount (Low-High)</option>
                    <option value="amount-desc">Amount (High-Low)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="date-desc">Date (Newest)</option>
                </select>
                <img src="/images/sort-icon.png" className="w-6 h-6 cursor-pointer opacity-80" onClick={() => sortRef.current?.showPicker?.()} alt="Sort" />
            </div>
        </div>

        {/* --- MAIN CONTENT (Vertical Scroll) --- */}
        {loading ? (
            <p className="text-center text-gray-500 mt-10">Loading...</p>
        ) : (
            <div className="space-y-12">
                
                {/* SECTION 1: APPEALS */}
                {/* On mobile, hidden if view is 'all'. On desktop, always shown. */}
                <div className={`${mobileView === "appeals" ? "block" : "hidden"} md:block`}>
                    <h3 className="text-2xl font-bold text-text mb-4 ">
                        Pending Appeals
                    </h3>
                    
                    {appealsData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {appealsData.map(c => <ChallanCard key={c.id} challan={c} isAppeal={true} />)}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No pending appeals.</p>
                    )}
                </div>

                {/* SECTION 2: ALL CHALLANS */}
                {/* On mobile, hidden if view is 'appeals'. On desktop, always shown. */}
                <div className={`${mobileView === "all" ? "block" : "hidden"} md:block`}>
                    <h3 className="text-2xl font-bold text-text mb-4 ">
                        All Challans
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allChallansData.map(c => <ChallanCard key={c.id} challan={c} />)}
                        {allChallansData.length === 0 && <p className="text-gray-500">No challans found.</p>}
                    </div>
                </div>

            </div>
        )}

        {/* --- MODAL 1: EDIT CHALLAN --- */}
        {selectedChallan && !selectedAppeal && (
           <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
             <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => setSelectedChallan(null)} className="absolute top-2 right-2 text-xl font-bold text-text">&times;</button>
                <h2 className="text-xl font-bold mb-4">Edit Challan</h2>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="text-lg font-bold">{selectedChallan.bike_number || selectedChallan.bike}</p>
                        <p className="text-sm text-gray-500">Challan ID: #{selectedChallan.id}</p>
                    </div>
                    <p className="text-sm"><strong>Rule:</strong> {selectedChallan.rule_name}</p>
                    <p className="text-sm"><strong>Due:</strong> {selectedChallan.due_date}</p>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select 
                            className="w-full p-2 border rounded"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                        >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="UnderAppeal">Under Appeal</option>
                        </select>
                    </div>
                    <button onClick={handleUpdateChallan} className="w-full bg-primary text-white py-2 rounded hover:bg-brand">
                        Save Changes
                    </button>
                </div>
             </div>
           </div>
        )}

        {/* --- MODAL 2: VIEW APPEAL --- */}
        {selectedAppeal && selectedChallan && (
           <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
             <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={() => { setSelectedAppeal(null); setSelectedChallan(null); }} className="absolute top-2 right-2 text-xl font-bold text-text">&times;</button>
                <h2 className="text-xl font-bold mb-4">Appeal Details</h2>
                
                <div className="bg-gray-50 p-3 rounded mb-4 border">
                    <p className="font-bold text-sm text-gray-700">Bike: {selectedChallan.bike_number}</p>
                    <hr className="my-2"/>
                    <p className="text-sm italic">"{selectedAppeal.reason}"</p>
                    {selectedAppeal.evidence_url && selectedAppeal.evidence_url !== "N/A" && (
                        <a href={selectedAppeal.evidence_url} target="_blank" className="text-blue-600 text-xs underline block mt-1">View Evidence</a>
                    )}
                </div>

                <div className="flex gap-2 mb-4">
                    <button onClick={() => handleUpdateAppeal("Approved")} className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700">Approve Appeal</button>
                    <button onClick={() => handleUpdateAppeal("Rejected")} className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700">Reject Appeal</button>
                </div>

                <hr className="my-4"/>
                <p className="text-xs text-gray-500 mb-2">Or update status manually:</p>
                <div className="flex gap-2">
                    <select className="flex-1 p-1 border rounded text-sm" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <button onClick={handleUpdateChallan} className="bg-primary text-white px-3 rounded text-sm">Update</button>
                </div>
             </div>
           </div>
        )}

      </div>
    </>
  );
}