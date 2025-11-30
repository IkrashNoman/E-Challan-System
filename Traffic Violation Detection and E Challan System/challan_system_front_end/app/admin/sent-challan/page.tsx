'use client';

import { useState, useRef } from 'react';
import Header from "@/app/components/Header";
import AdminNavBar from "../components/AdminNavBar";

const initialChallans = [
  { 
    id: 1, 
    bikeNumber: "AB-1234", 
    ruleViolated: "No Helmet Wearing", 
    challanAmount: 500, 
    status: "Unpaid",
    date: "2024-01-15",
    location: "Main Street",
    officer: "John Doe"
  },
  { 
    id: 2, 
    bikeNumber: "CD-5678", 
    ruleViolated: "Crossing Red Light", 
    challanAmount: 1000, 
    status: "Paid",
    date: "2024-01-14",
    location: "Central Square",
    officer: "Jane Smith"
  },
  { 
    id: 3, 
    bikeNumber: "EF-9012", 
    ruleViolated: "Triple Seat", 
    challanAmount: 400, 
    status: "Unpaid",
    date: "2024-01-13",
    location: "Market Road",
    officer: "Mike Johnson"
  },
  { 
    id: 4, 
    bikeNumber: "GH-3456", 
    ruleViolated: "Causing Trouble on Road", 
    challanAmount: 800, 
    status: "Paid",
    date: "2024-01-12",
    location: "Highway Exit",
    officer: "Sarah Wilson"
  },
  { 
    id: 5, 
    bikeNumber: "IJ-7890", 
    ruleViolated: "Drink and Drive", 
    challanAmount: 10000, 
    status: "Unpaid",
    date: "2024-01-11",
    location: "Downtown",
    officer: "Robert Brown"
  },
];

// Available rules for dropdown
const availableRules = [
  { id: 1, name: "No Helmet Wearing", fine: 500 },
  { id: 2, name: "Crossing Red Light", fine: 1000 },
  { id: 3, name: "Causing Trouble on Road", fine: 800 },
  { id: 4, name: "Throwing Waste on Road", fine: 300 },
  { id: 5, name: "Triple Seat", fine: 400 },
  { id: 6, name: "Cause an Accident", fine: 5000 },
  { id: 7, name: "Drink and Drive", fine: 10000 },
];

export default function ChallanManagement() {
  const [challans, setChallans] = useState(initialChallans);
  const [editingChallan, setEditingChallan] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [mobileView, setMobileView] = useState("view");
  const sortRef = useRef(null);

  // Filter challans based on search
  const filteredChallans = challans.filter(challan => 
    challan.bikeNumber.toLowerCase().includes(search.toLowerCase()) ||
    challan.ruleViolated.toLowerCase().includes(search.toLowerCase()) ||
    challan.challanAmount.toString().includes(search)
  );

  // Sort challans
  const sortedChallans = [...filteredChallans].sort((a, b) => {
    switch (sortOption) {
      case "amount-asc":
        return a.challanAmount - b.challanAmount;
      case "amount-desc":
        return b.challanAmount - a.challanAmount;
      case "date-asc":
        return new Date(a.date) - new Date(b.date);
      case "date-desc":
        return new Date(b.date) - new Date(a.date);
      case "bike-asc":
        return a.bikeNumber.localeCompare(b.bikeNumber);
      case "bike-desc":
        return b.bikeNumber.localeCompare(a.bikeNumber);
      default:
        return 0;
    }
  });

  // Handle edit challan
  const handleEditChallan = (updatedChallan) => {
    setChallans(challans.map(challan => 
      challan.id === updatedChallan.id ? updatedChallan : challan
    ));
    setEditingChallan(null);
  };

  // Handle rule change in modal
  const handleRuleChange = (ruleName) => {
    const selectedRule = availableRules.find(rule => rule.name === ruleName);
    if (selectedRule && editingChallan) {
      setEditingChallan({
        ...editingChallan,
        ruleViolated: selectedRule.name,
        challanAmount: selectedRule.fine
      });
    }
  };

  return (
    <div>
      <div>
        <Header />
        <AdminNavBar />
        {/* Main Content */}
        <div className="p-6 bg-background min-h-screen relative">
          <h2 className="text-2xl font-bold text-text mb-4 md:block">
            View/Edit Challans
          </h2>

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
                placeholder="Search by bike number or rule..."
                className="pl-10 p-2 border rounded bg-surface w-full text-text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* SORT ICON ONLY */}
            <div className="relative flex items-center justify-end md:ml-auto mr-2">
              <select
                ref={sortRef}
                className="absolute opacity-0 pointer-events-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Default</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="date-desc">Date (Newest First)</option>
                <option value="bike-asc">Bike Number (A-Z)</option>
                <option value="bike-desc">Bike Number (Z-A)</option>
              </select>

              {/* Visible icon button */}
              <img
                src="/images/sort-icon.png"
                className="w-6 h-6 cursor-pointer opacity-80"
                onClick={() => sortRef.current?.click?.()}
                alt="Sort"
              />
            </div>
          </div>

          {/* CHALLANS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedChallans.map((challan) => (
              <div
                key={challan.id}
                className="p-4 border rounded bg-surface cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setEditingChallan(challan)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-text text-lg">{challan.bikeNumber}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    challan.status === "Paid" 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  }`}>
                    {challan.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-text-secondary">
                    <span className="font-semibold">Rule:</span> {challan.ruleViolated}
                  </p>
                  <p className="text-text-secondary">
                    <span className="font-semibold">Amount:</span> Rs {challan.challanAmount}
                  </p>
                  <p className="text-text-secondary">
                    <span className="font-semibold">Date:</span> {challan.date}
                  </p>
                  <p className="text-text-secondary text-sm">
                    <span className="font-semibold">Location:</span> {challan.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedChallans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">
                No challans found matching your search.
              </p>
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        {editingChallan && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-text font-bold text-xl hover:text-primary transition-colors"
                onClick={() => setEditingChallan(null)}
              >
                &times;
              </button>

              <h2 className="text-xl font-bold mb-4 text-text">Edit Challan</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-text mb-1">Bike Number</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full text-text"
                    value={editingChallan.bikeNumber}
                    onChange={(e) =>
                      setEditingChallan({ ...editingChallan, bikeNumber: e.target.value })
                    }
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-text mb-1">Rule Violated</label>
                  <select
                    className="p-2 border rounded bg-surface w-full text-text"
                    value={editingChallan.ruleViolated}
                    onChange={(e) => handleRuleChange(e.target.value)}
                  >
                    {availableRules.map((rule) => (
                      <option key={rule.id} value={rule.name}>
                        {rule.name} (Rs {rule.fine})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text mb-1">Challan Amount (Rs)</label>
                  <input
                    type="number"
                    className="p-2 border rounded bg-surface w-full text-text"
                    value={editingChallan.challanAmount}
                    onChange={(e) =>
                      setEditingChallan({ ...editingChallan, challanAmount: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-text mb-1">Status</label>
                  <select
                    className="p-2 border rounded bg-surface w-full text-text"
                    value={editingChallan.status}
                    onChange={(e) =>
                      setEditingChallan({ ...editingChallan, status: e.target.value })
                    }
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text mb-1">Date</label>
                  <input
                    type="date"
                    className="p-2 border rounded bg-surface w-full text-text"
                    value={editingChallan.date}
                    onChange={(e) =>
                      setEditingChallan({ ...editingChallan, date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-text mb-1">Location</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full text-text"
                    value={editingChallan.location}
                    onChange={(e) =>
                      setEditingChallan({ ...editingChallan, location: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-text mb-1">Issuing Officer</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full text-text"
                    value={editingChallan.officer}
                    onChange={(e) =>
                      setEditingChallan({ ...editingChallan, officer: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-brand transition-colors"
                  onClick={() => handleEditChallan(editingChallan)}
                >
                  Save Changes
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  onClick={() => setEditingChallan(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}