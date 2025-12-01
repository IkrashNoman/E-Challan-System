/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import NavBar from "@/app/components/NavBar";
import { toast } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

// Interface matching Backend Serializer
interface Rule {
  id: number;
  rule_name: string;
  description: string;
  fine_amount: string | number;
  exemption: string | null;
  other_penalties: string | null;
  start_date: string;
}

export default function UserRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // --- FETCH RULES ---
  const fetchRules = async () => {
    setLoading(true);
    try {
      // Fetch from the new public endpoint
      const res = await fetch(`${API_BASE}/api/challan/public/rules/`);
      
      if (res.ok) {
        const data = await res.json();
        setRules(data);
        setFilteredRules(data);
      } else {
        toast.error("Failed to load rules.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredRules(rules);
    } else {
      const s = search.toLowerCase();
      const filtered = rules.filter(
        (r) =>
          r.rule_name.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          r.fine_amount.toString().includes(s)
      );
      setFilteredRules(filtered);
    }
  }, [search, rules]);

  return (
    <>
      <Header />
      <NavBar />

      <div className="bg-background min-h-screen p-6 font-body text-text">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading text-text">Traffic Rules & Penalties</h1>
              <p className="text-text-secondary mt-1">Stay informed, stay safe.</p>
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* Search Icon */}
                    <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search rules..."
                    className="pl-10 p-3 w-full border border-[var(--accent)] rounded-lg bg-surface text-text focus:ring-2 focus:ring-[var(--primary)] outline-none transition-shadow"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </div>

          {/* CONTENT GRID */}
          {loading ? (
            <div className="text-center py-20 text-text-secondary">Loading regulations...</div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-xl border border-[var(--accent)]">
                <p className="text-xl font-heading text-text">No rules found.</p>
                <p className="text-text-secondary">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRules.map((rule) => (
                <div 
                    key={rule.id} 
                    className="bg-surface border border-[var(--accent)] rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold font-heading text-text leading-tight">{rule.rule_name}</h3>
                        <span className="bg-brand text-text px-3 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                            Rs {Number(rule.fine_amount).toLocaleString()}
                        </span>
                    </div>
                    
                    <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                        {rule.description}
                    </p>
                  </div>

                  {/* Footer Info */}
                  <div className="mt-4 pt-4 border-t border-[var(--accent)] text-xs text-text-secondary space-y-1">
                    {rule.other_penalties && rule.other_penalties !== "-" && (
                        <p><span className="font-semibold text-text">Penalty:</span> {rule.other_penalties}</p>
                    )}
                    {rule.exemption && rule.exemption !== "-" && (
                        <p><span className="font-semibold text-text">Exemption:</span> {rule.exemption}</p>
                    )}
                    <p className="text-[10px] opacity-70 mt-2">Effective: {rule.start_date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}