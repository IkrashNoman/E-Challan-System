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

export default function NewRule() {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"add" | "view">("view");

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");

  const sortRef = useRef<HTMLSelectElement>(null);

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
    if (window.innerWidth < 768) setMobileView("view");
  };

  const handleEditRule = (updatedRule: Rule) => {
    setRules(rules.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
    setEditingRule(null);
  };

  const filteredRules = useMemo(() => {
    let data = [...rules];

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
      case "date-asc":
        data.sort((a, b) => a.startDate.localeCompare(b.startDate));
        break;
      case "date-desc":
        data.sort((a, b) => b.startDate.localeCompare(a.startDate));
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

  return (
    <>
      <Header />
      <AdminNavBar />

      <div className="p-6 bg-background min-h-screen relative">
        
        {/* MOBILE NAV */}
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
                  Edit Existing Rule
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

        {/* ADD NEW RULE */}
        <div className={`${mobileView === "add" ? "block" : "hidden"} md:block mb-10`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">Add the New Rule</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text mb-1">New Rule Name</label>
              <input
                type="text"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Fine (Rs)</label>
              <input
                type="number"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.fine}
                onChange={(e) => setNewRule({ ...newRule, fine: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-text mb-1">Description</label>
              <input
                type="text"
                className="p-2 border rounded bg-surface w-full"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Exemption</label>
              <input
                type="text"
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
                value={newRule.startDate}
                onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-text mb-1">Other Penalties</label>
              <input
                type="text"
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

        {/* VIEW / EDIT EXISTING */}
        <div className={`${mobileView === "view" ? "block" : "hidden"} md:block`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">
            View/Edit Existing Rules
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
      placeholder="Search by name or fine..."
      className="pl-10 p-2 border rounded bg-surface w-full"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* SORT ICON ONLY */}
  <div className="relative flex items-center justify-end md:ml-auto mr-2">
    
    <select
      ref={sortRef}
      className="absolute pointer-events-none"
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
    >
      <option value="">Default</option>
      <option value="fine-asc">Fine (ASC)</option>
      <option value="fine-desc">Fine (DSC)</option>
      <option value="date-asc">Date Added (ASC)</option>
      <option value="date-desc">Date Added (DSC)</option>
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

        {/* EDIT MODAL */}
        {editingRule && (
          <div className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-text font-bold text-xl"
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
                    value={editingRule.name}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, name: e.target.value })
                    }
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

              <button
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-brand"
                onClick={() => handleEditRule(editingRule)}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
