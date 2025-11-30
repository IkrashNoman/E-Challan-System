/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useRef } from "react";
import Header from "@/app/components/Header";
import AdminNavBar from "../components/AdminNavBar";

interface Rule {
  id: number;
  name: string;
  fine: number;
  description: string;
  exemption: string;
  startDate: string;
  otherPenalties: string;
  status: boolean;
}

export default function Challan() {
  const [rules] = useState<Rule[]>([
    { id: 1, name: "No Helmet Wearing", fine: 500, description: "Not wearing helmet while riding bike", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 2, name: "Crossing Red Light", fine: 1000, description: "Ignoring traffic signal", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 3, name: "Causing Trouble on Road", fine: 800, description: "Disrupting traffic", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 4, name: "Throwing Waste on Road", fine: 300, description: "Littering public spaces", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: false },
    { id: 5, name: "Triple Seat", fine: 400, description: "Carrying extra passengers on bike", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 6, name: "Cause an Accident", fine: 5000, description: "Involvement in accident due to negligence", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 7, name: "Drink and Drive", fine: 10000, description: "Driving under influence of alcohol", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 8, name: "Not Having License", fine: 2000, description: "Riding without a valid license", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 9, name: "Not Carrying Bike's Copy", fine: 300, description: "Failing to carry vehicle documents", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: false },
    { id: 10, name: "Underage Driving", fine: 1500, description: "Riding below legal age", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 11, name: "Using Mobile Phone", fine: 500, description: "Using phone while driving", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 12, name: "No Parking Zone", fine: 400, description: "Parking in restricted area", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 13, name: "Carrying Oversized Loads", fine: 800, description: "Transporting oversized materials", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 14, name: "No Number Plate", fine: 1000, description: "Vehicle without number plate", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
    { id: 15, name: "Fake Number Plate", fine: 5000, description: "Tampering with number plate", exemption: "-", startDate: new Date().toISOString().split("T")[0], otherPenalties: "-", status: true },
  ]);

  const [challanData, setChallanData] = useState({
    bikeNumber: "",
    violatedRule: "",
    image: null as File | null,
    totalAmount: 0
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChallanData({ ...challanData, image: file });
    }
  };

  const handleRuleSelect = (ruleId: string) => {
    const selectedRule = rules.find(rule => rule.id === parseInt(ruleId));
    if (selectedRule) {
      setChallanData({ 
        ...challanData, 
        violatedRule: ruleId,
        totalAmount: selectedRule.fine
      });
    }
  };

  const handleSendChallan = () => {
    if (!challanData.bikeNumber || !challanData.violatedRule) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Here you would typically send the data to your backend
    console.log("Sending challan:", challanData);
    alert("Challan sent successfully!");
    
    // Reset form
    setChallanData({
      bikeNumber: "",
      violatedRule: "",
      image: null,
      totalAmount: 0
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredRules = useMemo(() => {
    let data = [...rules].filter(rule => rule.status); // Only show active rules

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.fine.toString().includes(s)
      );
    }

    switch (sortOption) {
      case "fine-asc":
        data.sort((a, b) => a.fine - b.fine);
        break;
      case "fine-desc":
        data.sort((a, b) => b.fine - a.fine);
        break;
      case "name-asc":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return data;
  }, [rules, search, sortOption]);

  const selectedRule = rules.find(rule => rule.id === parseInt(challanData.violatedRule));

  return (
    <>
      <Header />
      <AdminNavBar />

      <div className="p-6 bg-background min-h-screen relative">

        {/* MAIN CONTENT */}
        <div className="mx-auto">
          {/* CHALLAN FORM */}
          <div className="max-w-4xl mb-10 mx-auto">
            <h2 className="text-2xl font-bold text-text mb-6 md:block">Create New Challan</h2>

            <div className="bg-surface border rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bike Number */}
                <div className="md:col-span-2">
                  <label className="block text-text mb-2 font-medium">Bike Number</label>
                  <input
                    type="text"
                    className="p-3 border rounded bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter bike number plate"
                    value={challanData.bikeNumber}
                    onChange={(e) => setChallanData({ ...challanData, bikeNumber: e.target.value.toUpperCase() })}
                  />
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
                    {rules
                      .filter(rule => rule.status)
                      .map(rule => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name} - Rs {rule.fine}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-text mb-2 font-medium">Number Plate Image</label>
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
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-brand transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Image
                    </button>
                    <p className="text-text-secondary mt-2 text-sm">
                      {challanData.image ? challanData.image.name : "No file chosen"}
                    </p>
                  </div>
                </div>

                {/* Total Amount Display */}
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

                {/* Send Challan Button */}
                <div className="md:col-span-2">
                  <button
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-brand transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendChallan}
                    disabled={!challanData.bikeNumber || !challanData.violatedRule}
                  >
                    Send Challan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RULES LIST FOR REFERENCE */}
          <div>
            <h2 className="text-2xl font-bold text-text mb-4">Available Rules</h2>
            
            {/* SEARCH + SORT */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              {/* SEARCH WITH ICON */}
              <div className="relative w-full md:w-1/2">
                <img
                  src="/images/search-icon.png"
                  className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
                  alt="Search"
                />
                <input
                  type="text"
                  placeholder="Search rules..."
                  className="pl-10 p-2 border rounded bg-surface w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* SORT ICON ONLY */}
              <div className="relative flex items-center justify-end md:ml-auto mr-2">
                <select
                  ref={sortRef}
                  className="absolute pointer-events-none opacity-0"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="">Default</option>
                  <option value="fine-asc">Fine (ASC)</option>
                  <option value="fine-desc">Fine (DSC)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>

                {/* Visible icon button */}
                <img
                  src="/images/sort-icon.png"
                  className="w-6 h-6 cursor-pointer opacity-80"
                  onClick={() => sortRef.current?.showPicker?.()}
                  alt="Sort"
                />
              </div>
            </div>

            {/* RULES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 border rounded bg-surface cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleRuleSelect(rule.id.toString())}
                >
                  <h3 className="font-bold text-text">{rule.name}</h3>
                  <p className="text-text-secondary">Fine: Rs {rule.fine}</p>
                  <p className="text-text-secondary text-sm">
                    {rule.description.substring(0, 60)}...
                  </p>
                  <div className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                    rule.status 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {rule.status ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}