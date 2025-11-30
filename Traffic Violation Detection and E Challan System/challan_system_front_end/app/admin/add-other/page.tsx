/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Header from "@/app/components/Header";
import AdminNavBar from "../components/AdminNavBar";
import { toast } from "react-toastify";

// --- Backend Interfaces ---
interface AreaData {
  id: number;
  city: string;
  zone: string; // Used as "Area" in dropdown
  sub_area: string;
}

interface Officer {
  id: number;
  name: string;
  rank: string;
  email: string;
  status: string; 
  profile_pic_url?: string;
  area_details?: AreaData;
  plain_password?: string;
}

// Rank options from low to high
const rankOptions = [
  "Constable",
  "Head Constable",
  "ASI",
  "SI",
  "Inspector"
];

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:8000";

export default function AddOther() {
  // --- State ---
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State for Adding
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    rank: "",
    city: "",
    areaName: "",
    subAreaName: "",
    profilePicture: "",
    email: "",
    password: "",
  });

  // State for Editing
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    rank: "",
    email: "",
    city: "",
    areaName: "",
    subAreaName: "",
    status: "Active",
    password: ""
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"add" | "view">("view");

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("");

  const sortRef = useRef<HTMLSelectElement>(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchAreas();
    fetchOfficers();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/officer/areas/`);
      if (res.ok) {
        const data = await res.json();
        setAreas(data);
      }
    } catch (error) {
      console.error("Error fetching areas", error);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/officer/list/`);
      if (res.ok) {
        const data = await res.json();
        setOfficers(data);
      }
    } catch (error) {
      console.error("Error fetching officers", error);
    }
  };

  // --- 2. DROPDOWN LOGIC (Dynamic from Backend) ---
  
  const uniqueCities = useMemo(() => {
    const cities = areas.map(a => a.city);
    return Array.from(new Set(cities));
  }, [areas]);

  // For Add Form
  const getZones = (city: string) => {
    const filtered = areas.filter(a => a.city === city);
    return Array.from(new Set(filtered.map(a => a.zone)));
  };
  const getSubAreas = (city: string, zone: string) => {
    const filtered = areas.filter(a => a.city === city && a.zone === zone);
    return Array.from(new Set(filtered.map(a => a.sub_area)));
  };

  // For Edit Form
  const getEditZones = (city: string) => {
    const filtered = areas.filter(a => a.city === city);
    return Array.from(new Set(filtered.map(a => a.zone)));
  };
  const getEditSubAreas = (city: string, zone: string) => {
    const filtered = areas.filter(a => a.city === city && a.zone === zone);
    return Array.from(new Set(filtered.map(a => a.sub_area)));
  };

  const findAreaId = (city: string, zone: string, subArea: string) => {
    const area = areas.find(a => a.city === city && a.zone === zone && a.sub_area === subArea);
    return area ? area.id : null;
  };

  // --- 3. HANDLERS ---

  const handleAddOfficer = async () => {
    const { name, rank, email, password, city, areaName, subAreaName, profilePicture } = newOfficer;
    
    if (!name || !rank || !email || !password || !city || !areaName) {
      toast.error("Please fill all required fields");
      return;
    }

    const areaId = findAreaId(city, areaName, subAreaName);
    if (!areaId) {
      toast.error("Selected Area combination is invalid");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/officer/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rank,
          email,
          password,
          area: areaId,
          profile_pic_url: profilePicture,
          status: "Active"
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Officer Added Successfully!");
        setNewOfficer({ name: "", rank: "", city: "", areaName: "", subAreaName: "", profilePicture: "", email: "", password: "" });
        fetchOfficers();
        if (window.innerWidth < 768) setMobileView("view");
      } else {
        toast.error(JSON.stringify(data));
      }
    } catch (error) {
      toast.error("Failed to create officer");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (officer: Officer) => {
    setEditingOfficer(officer);
    setEditForm({
      name: officer.name,
      rank: officer.rank,
      email: officer.email,
      status: officer.status,
      city: officer.area_details?.city || "",
      areaName: officer.area_details?.zone || "",
      subAreaName: officer.area_details?.sub_area || "",
      password: ""
    });
  };

  const handleUpdateOfficer = async () => {
    if (!editingOfficer) return;

    const areaId = findAreaId(editForm.city, editForm.areaName, editForm.subAreaName);
    
    const payload: any = {
      name: editForm.name,
      rank: editForm.rank,
      email: editForm.email,
      status: editForm.status,
    };
    if (areaId) payload.area = areaId;
    if (editForm.password) payload.password = editForm.password;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/officer/update/${editingOfficer.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Officer Updated");
        setEditingOfficer(null);
        fetchOfficers();
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Error updating officer");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOfficer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this officer?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/officer/delete/${id}/`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Officer Deleted");
        setEditingOfficer(null);
        fetchOfficers();
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting officer");
    }
  };

  // Image Helper
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
        // Placeholder for file upload logic
        // For real implementation, you would upload to server here and get URL back
        // setNewOfficer({ ...newOfficer, profilePicture: "uploaded_url.jpg" });
    }
  };

  // --- 4. FILTERING & SORTING ---
  const filteredOfficers = useMemo(() => {
    let data = [...officers];

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.rank.toLowerCase().includes(s) ||
          a.area_details?.city.toLowerCase().includes(s) ||
          a.area_details?.zone.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s)
      );
    }

    switch (sortOption) {
      case "name-asc":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "rank-asc":
        data.sort((a, b) => rankOptions.indexOf(a.rank) - rankOptions.indexOf(b.rank));
        break;
      case "rank-desc":
        data.sort((a, b) => rankOptions.indexOf(b.rank) - rankOptions.indexOf(a.rank));
        break;
      case "city-asc":
        data.sort((a, b) => (a.area_details?.city || "").localeCompare(b.area_details?.city || ""));
        break;
      case "city-desc":
        data.sort((a, b) => (b.area_details?.city || "").localeCompare(a.area_details?.city || ""));
        break;
    }

    return data;
  }, [officers, search, sortOption]);

  return (
    <>
      <Header />
      <AdminNavBar />

      <div className="p-6 bg-background min-h-screen relative">
        
        {/* MOBILE NAV */}
        <div className="md:hidden flex justify-between items-center mb-6 border-b pb-4 relative z-20">
          <h2 className="text-xl font-bold text-text">
            {mobileView === "add" ? "Add New Admin" : "Existing Admins"}
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
                  View Existing Admins
                </button>
                <button
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${mobileView === "add" ? "bg-gray-50 font-bold" : ""}`}
                  onClick={() => { setMobileView("add"); setMobileMenuOpen(false); }}
                >
                  Add New Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ADD NEW ADMIN SECTION - Distinct Background Color */}
        <div className={`${mobileView === "add" ? "block" : "hidden"} md:block mb-10`}>
          <div className="bg-surface p-6 rounded-lg border border-blue-100 shadow-sm">
            <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">Add New Officer</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text mb-1">Name *</label>
                <input
                  type="text"
                  className="p-2 border rounded bg-white w-full"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                  placeholder="Enter officer name"
                />
              </div>
              <div>
                <label className="block text-text mb-1">Rank *</label>
                <select
                  className="p-2 border rounded bg-white w-full"
                  value={newOfficer.rank}
                  onChange={(e) => setNewOfficer({ ...newOfficer, rank: e.target.value })}
                >
                  <option value="">Select Rank</option>
                  {rankOptions.map((rank) => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text mb-1">City *</label>
                <select
                  className="p-2 border rounded bg-white w-full"
                  value={newOfficer.city}
                  onChange={(e) => setNewOfficer({ ...newOfficer, city: e.target.value, areaName: "", subAreaName: "" })}
                >
                  <option value="">Select City</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text mb-1">Area *</label>
                <select
                  className="p-2 border rounded bg-white w-full"
                  value={newOfficer.areaName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, areaName: e.target.value, subAreaName: "" })}
                  disabled={!newOfficer.city}
                >
                  <option value="">Select Area</option>
                  {getZones(newOfficer.city).map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text mb-1">Sub Area</label>
                <select
                  className="p-2 border rounded bg-white w-full"
                  value={newOfficer.subAreaName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, subAreaName: e.target.value })}
                  disabled={!newOfficer.areaName}
                >
                  <option value="">Select Sub Area</option>
                  {getSubAreas(newOfficer.city, newOfficer.areaName).map((subArea) => (
                    <option key={subArea} value={subArea}>{subArea}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text mb-1">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  className="p-2 border rounded bg-white w-full"
                  onChange={(e) => handleProfilePictureChange(e, false)}
                />
              </div>
              <div>
                <label className="block text-text mb-1">Email *</label>
                <input
                  type="email"
                  className="p-2 border rounded bg-white w-full"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-text mb-1">Password *</label>
                <input
                  type="password"
                  className="p-2 border rounded bg-white w-full"
                  value={newOfficer.password}
                  onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            </div>
            <button
              className="mt-4 px-6 py-2 bg-primary text-white rounded hover:bg-brand disabled:opacity-50 transition-colors"
              onClick={handleAddOfficer}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Officer"}
            </button>
          </div>
        </div>

        {/* VIEW / EDIT EXISTING SECTION */}
        <div className={`${mobileView === "view" ? "block" : "hidden"} md:block`}>
          <h2 className="text-2xl font-bold text-text mb-4 hidden md:block">
            Existing Officers
          </h2>

          {/* SEARCH + SORT */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-1/2">
              <img
                src="/images/search-icon.png"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-70"
                alt="Search"
              />
              <input
                type="text"
                placeholder="Search by name, rank, city..."
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
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="rank-asc">Rank (Low to High)</option>
              </select>
              <img
                src="/images/sort-icon.png"
                className="w-6 h-6 cursor-pointer opacity-80"
                onClick={() => sortRef.current?.showPicker?.()}
                alt="Sort"
              />
            </div>
          </div>

          {/* ADMINS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOfficers.map((admin) => (
              <div
                key={admin.id}
                className="p-4 border rounded bg-surface cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => startEditing(admin)}
              >
                <div className="flex items-center gap-3 mb-2">
                  {admin.profile_pic_url ? (
                    <img
                      src={admin.profile_pic_url}
                      alt={admin.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    // AMAZING FEATURE: First Letter Avatar
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-text">{admin.name}</h3>
                    <p className="text-text-secondary text-sm">{admin.rank}</p>
                  </div>
                </div>
                <p className="text-text-secondary">City: {admin.area_details?.city}</p>
                <p className="text-text-secondary">Area: {admin.area_details?.zone}</p>
                {admin.area_details?.sub_area && <p className="text-text-secondary">Sub Area: {admin.area_details.sub_area}</p>}
                <p className="text-text-secondary">Email: {admin.email}</p>
                <p className="text-text-secondary mt-1">
                  Status: 
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                    admin.status === "Active" ? "bg-green-100 text-green-700" : 
                    admin.status === "Inactive" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {admin.status}
                  </span>
                </p>
              </div>
            ))}
            {filteredOfficers.length === 0 && <p className="text-gray-500 col-span-full text-center">No officers found.</p>}
          </div>
        </div>

        {/* EDIT MODAL */}
        {editingOfficer && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-background p-6 rounded shadow-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-text font-bold text-xl hover:text-gray-600"
                onClick={() => setEditingOfficer(null)}
              >
                &times;
              </button>

              <h2 className="text-xl font-bold mb-4">Edit Officer</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text mb-1">Name</label>
                  <input
                    type="text"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Rank</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.rank}
                    onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                  >
                    {rankOptions.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">City</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value, areaName: "", subAreaName: "" })}
                  >
                    <option value="">Select City</option>
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">Area</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.areaName}
                    onChange={(e) => setEditForm({ ...editForm, areaName: e.target.value, subAreaName: "" })}
                    disabled={!editForm.city}
                  >
                    <option value="">Select Area</option>
                    {getEditZones(editForm.city).map((zone) => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">Sub Area</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.subAreaName}
                    onChange={(e) => setEditForm({ ...editForm, subAreaName: e.target.value })}
                    disabled={!editForm.areaName}
                  >
                    <option value="">Select Sub Area</option>
                    {getEditSubAreas(editForm.city, editForm.areaName).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">Email</label>
                  <input
                    type="email"
                    className="p-2 border rounded bg-gray-100 w-full"
                    value={editForm.email}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-text mb-1">Status</label>
                  <select
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Leave">Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text mb-1">New Password</label>
                  <input
                    type="password"
                    className="p-2 border rounded bg-surface w-full"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="(Optional)"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-brand flex-1"
                  onClick={handleUpdateOfficer}
                  disabled={loading}
                >
                  Save Changes
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex-1"
                  onClick={() => handleDeleteOfficer(editingOfficer.id)}
                  disabled={loading}
                >
                  Delete Officer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}