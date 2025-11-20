"use client";

import { useState } from "react";
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

export default function NewRule() {
  // --- STATE MANAGEMENT ---
  const [rules, setRules] = useState<Rule[]>([
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

  const [newRule, setNewRule] = useState<Omit<Rule, "id" | "status">>({
    name: "",
    fine: 0,
    description: "",
    exemption: "",
    startDate: new Date().toISOString().split("T")[0],
    otherPenalties: "",
  });

  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  // Mobile Specific State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Default view is 'view' (Edit existing rule) as requested
  const [mobileView, setMobileView] = useState<"add" | "view">("view");

  // --- HANDLERS ---
  const handleAddRule = () => {
    if (!newRule.name) return;
    setRules([
      ...rules,
      {
        id: rules.length + 1,
        ...newRule,
        status: true,
      },
    ]);
    setNewRule({
      name: "",
      fine: 0,
      description: "",
      exemption: "",
      startDate: new Date().toISOString().split("T")[0],
      otherPenalties: "",
    });
    // Optionally switch to view list after adding on mobile
    if (window.innerWidth < 768) {
        setMobileView("view");
    }
  };

  const handleEditRule = (updatedRule: Rule) => {
    setRules(rules.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
    setEditingRule(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavClick = (view: "add" | "view") => {
    setMobileView(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Header />
      <AdminNavBar />

      <div className="p-6 bg-background min-h-screen relative">
        
        {/* --- MOBILE NAVIGATION CONTROLS (Hidden on Desktop/md) --- */}
        <div className="md:hidden flex justify-between items-center mb-6 border-b pb-4 relative z-20">
            <h2 className="text-xl font-bold text-text">
                {mobileView === 'add' ? 'Add New Rule' : 'Existing Rules'}
            </h2>
            <div className="relative">
                <button onClick={toggleMobileMenu} className="focus:outline-none">
                    <img 
                        src={mobileMenuOpen ? "/images/menu-close-icon.png" : "/images/dropdown-icon.png"} 
                        alt="Menu" 
                        className="w-8 h-8 object-contain"
                    />
                </button>
                
                {/* Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="absolute right-0 top-10 w-56 bg-surface border shadow-xl rounded-md overflow-hidden z-30">
                        <button 
                            className={`w-full text-left px-4 py-3 border-b hover:bg-gray-100 ${mobileView === 'view' ? 'bg-gray-50 font-bold' : ''}`}
                            onClick={() => handleMobileNavClick("view")}
                        >
                            Edit Existing Rule
                        </button>
                        <button 
                            className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${mobileView === 'add' ? 'bg-gray-50 font-bold' : ''}`}
                            onClick={() => handleMobileNavClick("add")}
                        >
                            Add New Rule
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* --- ADD NEW RULE SECTION --- */}
        {/* Logic: Hidden on mobile IF view is NOT 'add'. Always Block on Desktop (md) */}
        <div className={`${mobileView === 'add' ? 'block' : 'hidden'} md:block mb-10`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">Add the New Rule</h2>
          
          {/* Grid: 1 col on mobile (One input per line), 2 cols on md */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field - Full width on mobile */}
            <div className="w-full">
              <label className="block text-text mb-1">New Rule Name</label>
              <input
                type="text"
                placeholder="Enter rule name"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Fine (Rs)</label>
              <input
                type="number"
                placeholder="Enter fine amount"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.fine}
                onChange={(e) => setNewRule({ ...newRule, fine: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-text mb-1">Description</label>
              <input
                type="text"
                placeholder="Enter description"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Exemption</label>
              <input
                type="text"
                placeholder="Enter exemption"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.exemption}
                onChange={(e) => setNewRule({ ...newRule, exemption: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Starts From</label>
              <input
                type="date"
                className="p-2 border rounded bg-surface w-full"
                min={new Date().toISOString().split("T")[0]}
                value={newRule.startDate}
                onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Other Penalties</label>
              <input
                type="text"
                placeholder="Enter other penalties"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.otherPenalties}
                onChange={(e) => setNewRule({ ...newRule, otherPenalties: e.target.value })}
              />
            </div>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-brand w-full md:w-auto"
            onClick={handleAddRule}
          >
            Add Rule
          </button>
        </div>

        {/* --- VIEW/EDIT EXISTING RULES SECTION --- */}
        {/* Logic: Hidden on mobile IF view is NOT 'view'. Always Block on Desktop (md) */}
        <div className={`${mobileView === 'view' ? 'block' : 'hidden'} md:block`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">View/Edit Existing Rules</h2>
          
          {/* Grid: 1 col on mobile (One card per line), 2 on md, 3 on lg */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 border rounded bg-surface cursor-pointer hover:shadow-lg"
                onClick={() => setEditingRule(rule)}
              >
                <h3 className="font-bold text-text">{rule.name}</h3>
                <p className="text-text-secondary">Fine: Rs {rule.fine}</p>
                <p className="text-text-secondary">
                  Description: {rule.description.substring(0, 50)}...
                </p>
                <p className="text-text-secondary">
                  Status: {rule.status ? "Currently Implemented" : "Not Implemented"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- EDIT MODAL --- */}
        {editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Max width and max height handling for small screens */}
            <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-text font-bold text-xl"
                onClick={() => setEditingRule(null)}
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Edit Rule</h2>
              
              {/* Grid: 1 col on mobile (One input per line) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-text mb-1">Rule Name</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Fine (Rs)</label>
                  <input
                    type="number"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingRule.fine}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, fine: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-text mb-1">Description</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingRule.description}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Exemption</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingRule.exemption}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, exemption: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Starts From</label>
                  <input
                    type="date"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingRule.startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Other Penalties</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editingRule.otherPenalties}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, otherPenalties: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-secondary text-white rounded hover:bg-accent"
                  onClick={() => setEditingRule(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-brand"
                  onClick={() => handleEditRule(editingRule)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}