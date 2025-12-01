/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import AdminNavBar from "../components/AdminNavBar";
import { toast } from "react-toastify";

// Backend Rule Interface
interface Rule {
  id: number;
  rule_name: string;
  fine_amount: string | number;
  description: string;
  exemption: string | null;
  start_date: string;
  other_penalties: string | null;
  created_at?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

export default function NewRule() {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State to track token issues
  const [authError, setAuthError] = useState(false);

  // Form State
  const [newRule, setNewRule] = useState({
    name: "",
    fine: "",
    description: "",
    exemption: "-",
    startDate: new Date().toISOString().split("T")[0],
    otherPenalties: "-",
  });

  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    fine: "",
    description: "",
    exemption: "",
    startDate: "",
    otherPenalties: "",
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"add" | "view">("view");
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const sortRef = useRef<HTMLSelectElement>(null);

  // --- HELPER: Get Token ---
  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("officerToken") : null;
    if (!token) return null;

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    };
  };

  // --- HELPER: Manual Logout ---
  const handleManualLogout = () => {
    localStorage.removeItem("officerToken");
    localStorage.removeItem("officerRefreshToken");
    localStorage.removeItem("officerName");
    localStorage.removeItem("officerRank");
    router.push("/admin/signup"); // Redirect to login
  };

  // --- 1. FETCH RULES ---
  const fetchRules = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
        // If no token at all, just stop silently (middleware/nav usually handles this)
        return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/challan/rules/all/`, {
        headers: headers, 
      });
      
      const data = await res.json();

      if (res.ok) {
        setRules(data);
        setAuthError(false);
      } else {
        console.error("Fetch rules failed:", data);
        // Specifically catch the "user_not_found" or 401 error
        if (res.status === 401 || data.code === "user_not_found") {
             setAuthError(true);
        }
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // --- 2. ADD RULE ---
  const handleAddRule = async () => {
    if (!newRule.name || !newRule.fine) {
      toast.error("Please enter Name and Fine amount");
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
        setAuthError(true);
        return;
    }

    setLoading(true);
    try {
      const payload = {
        rule_name: newRule.name,
        fine_amount: Number(newRule.fine),
        description: newRule.description || "No Description",
        exemption: newRule.exemption,
        start_date: newRule.startDate,
        other_penalties: newRule.otherPenalties
      };

      const res = await fetch(`${API_BASE}/api/challan/rules/add/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Rule Added Successfully!");
        setNewRule({
          name: "",
          fine: "",
          description: "",
          exemption: "-",
          startDate: new Date().toISOString().split("T")[0],
          otherPenalties: "-",
        });
        fetchRules();
        if (window.innerWidth < 768) setMobileView("view");
      } else {
        if (res.status === 401 || data.code === "user_not_found") {
            setAuthError(true);
            toast.error("Session Invalid: User not found in DB.");
        } else {
            toast.error(JSON.stringify(data.error || data.detail) || "Failed to add rule");
        }
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. PREPARE EDIT ---
  const startEditing = (rule: Rule) => {
    setEditingRule(rule);
    setEditForm({
      name: rule.rule_name,
      fine: rule.fine_amount.toString(),
      description: rule.description,
      exemption: rule.exemption || "-",
      startDate: rule.start_date,
      otherPenalties: rule.other_penalties || "-"
    });
  };

  // --- 4. UPDATE RULE ---
  const handleUpdateRule = async () => {
    if (!editingRule) return;

    const headers = getAuthHeaders();
    if (!headers) {
        setAuthError(true);
        return;
    }

    setLoading(true);
    try {
      const payload = {
        rule_name: editForm.name,
        fine_amount: Number(editForm.fine),
        description: editForm.description,
        exemption: editForm.exemption,
        start_date: editForm.startDate,
        other_penalties: editForm.otherPenalties
      };

      const res = await fetch(`${API_BASE}/api/challan/rules/update/${editingRule.id}/`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Rule Updated");
        setEditingRule(null);
        fetchRules();
      } else {
        if (res.status === 401 || data.code === "user_not_found") {
            setAuthError(true);
        }
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Error updating rule");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. DELETE RULE ---
  const handleDeleteRule = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    const headers = getAuthHeaders();
    if (!headers) {
        setAuthError(true);
        return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/challan/rules/delete/${id}/`, {
        method: "DELETE",
        headers: headers,
      });

      if (res.ok) {
        toast.success("Rule Deleted");
        setEditingRule(null);
        fetchRules();
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting rule");
    }
  };

  const isRuleActive = (startDateString: string) => {
    const today = new Date();
    const startDate = new Date(startDateString);
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    return startDate <= today;
  };

  const filteredRules = useMemo(() => {
    let data = [...rules];
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.rule_name.toLowerCase().includes(s) ||
          r.fine_amount.toString().includes(s)
      );
    }
    switch (sortOption) {
      case "fine-asc":
        data.sort((a, b) => Number(a.fine_amount) - Number(b.fine_amount));
        break;
      case "fine-desc":
        data.sort((a, b) => Number(b.fine_amount) - Number(a.fine_amount));
        break;
      case "date-asc":
        data.sort((a, b) => a.start_date.localeCompare(b.start_date));
        break;
      case "date-desc":
        data.sort((a, b) => b.start_date.localeCompare(a.start_date));
        break;
      case "name-asc":
        data.sort((a, b) => a.rule_name.localeCompare(b.rule_name));
        break;
      case "name-desc":
        data.sort((a, b) => b.rule_name.localeCompare(a.rule_name));
        break;
    }
    return data;
  }, [rules, search, sortOption]);

  return (
    <>
      <Header />
      <AdminNavBar />

      <div className="p-6 bg-background min-h-screen relative">
        
        {/* --- ERROR BANNER WITH LOGOUT --- */}
        {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
                <div>
                    <strong className="font-bold">Authentication Error: </strong>
                    <span className="block sm:inline">The server cannot match your token to a user.</span>
                </div>
                <button 
                    onClick={handleManualLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                    Logout & Reset Session
                </button>
            </div>
        )}

        {/* MOBILE NAV TOGGLE */}
        <div className="md:hidden flex justify-between items-center mb-6 border-b pb-4 relative z-20">
          <h2 className="text-xl font-bold text-text">
            {mobileView === "add" ? "Add New Rule" : "Existing Rules"}
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
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-100 ${mobileView === "view" ? "bg-gray-50 font-bold" : ""}`}
                  onClick={() => { setMobileView("view"); setMobileMenuOpen(false); }}
                >
                  View Existing Rules
                </button>
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${mobileView === "add" ? "bg-gray-50 font-bold" : ""}`}
                  onClick={() => { setMobileView("add"); setMobileMenuOpen(false); }}
                >
                  Add New Rule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ADD RULE SECTION */}
        <div className={`${mobileView === "add" ? "block" : "hidden"} md:block mb-10`}>
          <div className="bg-surface p-6 rounded-lg border border-blue-100 shadow-sm">
            <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">Add New Rule</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text mb-1">Rule Name *</label>
                <input
                  type="text"
                  className="p-2 border rounded bg-white w-full"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Over Speeding"
                />
              </div>
              <div>
                <label className="block text-text mb-1">Fine (Rs) *</label>
                <input
                  type="number"
                  className="p-2 border rounded bg-white w-full"
                  value={newRule.fine}
                  onChange={(e) => setNewRule({ ...newRule, fine: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-text mb-1">Description</label>
                <input
                  type="text"
                  className="p-2 border rounded bg-white w-full"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Violation details..."
                />
              </div>
              <div>
                <label className="block text-text mb-1">Exemption</label>
                <input
                  type="text"
                  className="p-2 border rounded bg-white w-full"
                  value={newRule.exemption}
                  onChange={(e) => setNewRule({ ...newRule, exemption: e.target.value })}
                  placeholder="e.g. Emergency Vehicles"
                />
              </div>
              <div>
                <label className="block text-text mb-1">Starts From</label>
                <input
                  type="date"
                  className="p-2 border rounded bg-white w-full"
                  value={newRule.startDate}
                  onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-text mb-1">Other Penalties</label>
                <input
                  type="text"
                  className="p-2 border rounded bg-white w-full"
                  value={newRule.otherPenalties}
                  onChange={(e) => setNewRule({ ...newRule, otherPenalties: e.target.value })}
                  placeholder="e.g. License Suspension"
                />
              </div>
            </div>
            <button
              className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-brand disabled:opacity-50 transition-colors"
              onClick={handleAddRule}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Rule"}
            </button>
          </div>
        </div>

        {/* LIST RULES SECTION */}
        <div className={`${mobileView === "view" ? "block" : "hidden"} md:block`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">
            Existing Rules
          </h2>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-1/2">
              <img
                src="/images/search-icon.png"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
                alt="Search"
              />
              <input
                type="text"
                placeholder="Search by rule name..."
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
                <option value="fine-asc">Fine (Low-High)</option>
                <option value="fine-desc">Fine (High-Low)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
              <img
                src="/images/sort-icon.png"
                className="w-6 h-6 cursor-pointer opacity-80"
                onClick={() => sortRef.current?.showPicker?.()}
                alt="Sort"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRules.map((rule) => {
              const active = isRuleActive(rule.start_date);
              return (
                <div
                  key={rule.id}
                  className="p-4 border rounded bg-surface cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
                  onClick={() => startEditing(rule)}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${active ? "bg-green-500" : "bg-red-500"}`}></div>
                  <div className="pl-3">
                      <h3 className="font-bold text-text text-lg">{rule.rule_name}</h3>
                      <p className="text-primary font-bold mt-1">Rs {Number(rule.fine_amount).toLocaleString()}</p>
                      <p className="text-text-secondary mt-2 text-sm line-clamp-2">{rule.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>Start: {rule.start_date}</span>
                          <span className={`px-2 py-0.5 rounded font-medium ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {active ? "Active" : "Inactive"}
                          </span>
                      </div>
                  </div>
                </div>
              );
            })}
            {filteredRules.length === 0 && <p className="text-gray-500 col-span-full text-center">No rules found.</p>}
          </div>
        </div>

        {/* EDIT MODAL */}
        {editingRule && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-text font-bold text-xl hover:text-gray-600"
                onClick={() => setEditingRule(null)}
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Edit Rule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text mb-1">Rule Name</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Fine (Rs)</label>
                  <input
                    type="number"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.fine}
                    onChange={(e) => setEditForm({ ...editForm, fine: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-text mb-1">Description</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Exemption</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.exemption}
                    onChange={(e) => setEditForm({ ...editForm, exemption: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Starts From</label>
                  <input
                    type="date"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Other Penalties</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.otherPenalties}
                    onChange={(e) => setEditForm({ ...editForm, otherPenalties: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-brand flex-1"
                  onClick={handleUpdateRule}
                  disabled={loading}
                >
                  Save Changes
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-1"
                  onClick={() => handleDeleteRule(editingRule.id)}
                  disabled={loading}
                >
                  Delete Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}