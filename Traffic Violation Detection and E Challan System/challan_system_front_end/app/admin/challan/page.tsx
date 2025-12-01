/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Header from "@/app/components/Header";
import AdminNavBar from "../components/AdminNavBar";
import { toast } from "react-toastify";
import Tesseract from 'tesseract.js';

interface Rule {
  id: number;
  rule_name: string;      
  fine_amount: number;    
  description: string;
  exemption: string | null;
  start_date: string;
  other_penalties: string | null;
  status?: boolean;       
}

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

export default function Challan() {
  const [rules, setRules] = useState<Rule[]>([]);
  
  const [challanData, setChallanData] = useState({
    bikeNumber: "",
    violatedRule: "",
    image: null as File | null,
    totalAmount: 0
  });

  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("officerToken") : null;
    if (!token) return null;
    return {
      "Authorization": `Bearer ${token}`, 
    };
  };

  const fetchRules = async () => {
    const headers = getAuthHeaders();
    if (!headers) return; 

    try {
      const res = await fetch(`${API_BASE}/api/challan/rules/all/`, {
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      } else {
        console.error("Failed to fetch rules");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // --- CLIENT SIDE OCR ---
  const performOCR = async (file: File) => {
    setOcrLoading(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      
      // Clean text to get alphanumeric only (e.g. "ABC-123")
      const cleanedText = text.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();

      if (cleanedText) {
        setChallanData(prev => ({ ...prev, bikeNumber: cleanedText }));
        toast.info(`Number detected: ${cleanedText}`);
      } else {
        toast.warn("Could not detect text. Please type manually.");
      }
    } catch (error) {
      toast.error("Failed to scan image.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChallanData({ ...challanData, image: file });
      performOCR(file); // Only used for extracting text
    }
  };

  const handleRuleSelect = (ruleId: string) => {
    const selectedRule = rules.find(rule => rule.id === parseInt(ruleId));
    if (selectedRule) {
      setChallanData({ 
        ...challanData, 
        violatedRule: ruleId,
        totalAmount: Number(selectedRule.fine_amount)
      });
    }
  };

  // --- SEND ONLY TEXT DATA ---
  const handleSendChallan = async () => {
    if (!challanData.bikeNumber || !challanData.violatedRule) {
      toast.error("Please fill in bike number and rule");
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
        toast.error("You are not logged in.");
        return;
    }

    setLoading(true);

    try {
        // We only send text fields. Image is NOT sent.
        const payload = {
            bike_number: challanData.bikeNumber, // Extracted or Typed Text
            rule_id: challanData.violatedRule,
        };

        const res = await fetch(`${API_BASE}/api/challan/create/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            toast.success("Challan Sent Successfully!");
            setChallanData({
                bikeNumber: "",
                violatedRule: "",
                image: null,
                totalAmount: 0
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
            toast.error(data.error || "Failed to create challan");
        }
    } catch (error) {
        toast.error("Network Error");
    } finally {
        setLoading(false);
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
    let data = [...rules].filter(rule => isRuleActive(rule.start_date)); 
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(r => r.rule_name.toLowerCase().includes(s));
    }
    // ... sorting logic same as before ...
    return data;
  }, [rules, search]);

  const selectedRule = rules.find(rule => rule.id === parseInt(challanData.violatedRule));

  return (
    <>
      <Header />
      <AdminNavBar />
      <div className="p-6 bg-background min-h-screen relative">
        <div className="mx-auto">
          <div className="max-w-4xl mb-10 mx-auto">
            <h2 className="text-2xl font-bold text-text mb-6 md:block">Create New Challan</h2>

            <div className="bg-surface border rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Upload for OCR */}
                <div className="md:col-span-2">
                  <label className="block text-text mb-2 font-medium">Number Plate Image (Auto-Fill)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-brand transition-colors disabled:bg-gray-400"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={ocrLoading}
                    >
                      {ocrLoading ? "Scanning Image..." : "Upload to Scan"}
                    </button>
                    <p className="text-text-secondary mt-2 text-sm">
                      {challanData.image ? challanData.image.name : "No file chosen"}
                    </p>
                  </div>
                </div>

                {/* Bike Number Input */}
                <div className="md:col-span-2">
                  <label className="block text-text mb-2 font-medium">Bike Number</label>
                  <div className="relative">
                    <input
                        type="text"
                        className={`p-3 border rounded bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary ${ocrLoading ? 'opacity-50' : ''}`}
                        placeholder={ocrLoading ? "Scanning..." : "Enter bike number plate"}
                        value={challanData.bikeNumber}
                        onChange={(e) => setChallanData({ ...challanData, bikeNumber: e.target.value.toUpperCase() })}
                        readOnly={ocrLoading}
                    />
                  </div>
                </div>

                {/* Violated Rule Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-text mb-2 font-medium">Violated Rule</label>
                  <select
                    className="p-3 border rounded bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    value={challanData.violatedRule}
                    onChange={(e) => handleRuleSelect(e.target.value)}
                  >
                    <option value="">Select a violation</option>
                    {filteredRules.map(rule => (
                        <option key={rule.id} value={rule.id}>
                          {rule.rule_name} - Rs {Number(rule.fine_amount)}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Total Amount */}
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <label className="block text-text mb-2 font-medium">Total Amount</label>
                    <div className="text-2xl font-bold text-primary">
                      Rs {challanData.totalAmount}
                    </div>
                    {selectedRule && (
                      <p className="text-text-secondary text-sm mt-2">
                        {selectedRule.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="md:col-span-2">
                  <button
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-brand transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendChallan}
                    disabled={!challanData.bikeNumber || !challanData.violatedRule || loading}
                  >
                    {loading ? "Sending..." : "Send Challan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}