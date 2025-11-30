/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function AdminNavBar() {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [activePage, setActivePage] = useState<string>("Home");
    
    // --- AUTH STATE ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [officerName, setOfficerName] = useState("");
    const [officerRank, setOfficerRank] = useState("");

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // --- CHECK AUTH FUNCTION ---
    const checkAuth = () => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("officerToken");
            const name = localStorage.getItem("officerName");
            const rank = localStorage.getItem("officerRank");

            if (token && name) {
                setIsLoggedIn(true);
                setOfficerName(name);
                setOfficerRank(rank || "Officer");
            } else {
                setIsLoggedIn(false);
                setOfficerName("");
                setOfficerRank("");
            }
        }
    };

    // Run check on mount
    useEffect(() => {
        checkAuth();
        
        // Listen for storage changes (e.g. login from another tab)
        const handleStorageChange = () => checkAuth();
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    function handleSearch(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const trimmed = searchValue.trim();
        if (trimmed.length > 0) {
            setActivePage(trimmed.slice(0, 4));
            router.push(`/search/${encodeURIComponent(trimmed)}`);
        }
    }

    function handlePageChange(page: string) {
        setActivePage(page);
        setMenuOpen(false);
    }

    function handleLogout() {
        // Clear all admin auth data
        localStorage.removeItem("officerToken");
        localStorage.removeItem("officerRefreshToken");
        localStorage.removeItem("officerName");
        localStorage.removeItem("officerRank");
        
        setIsLoggedIn(false);
        setProfileMenuOpen(false);
        
        // Redirect to separate login page
        router.push("/admin/signup"); 
    }

    function handleLoginRedirect() {
        // Redirect to separate login page
        router.push("/admin/signup");
    }

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update active page based on route
    useEffect(() => {
        if (pathname === "/admin") setActivePage("Admin");
        else if (pathname.startsWith("/admin/challan")) setActivePage("Challan");
        else if (pathname.startsWith("/admin/new-rule")) setActivePage("New Rules");
        else if (pathname.startsWith("/admin/add-member")) setActivePage("Add Other");
        else if (pathname.startsWith("/admin/add-other")) setActivePage("Add Other");
        else setActivePage("404 Page");
    }, [pathname]);

    return (
        <nav className="bg-white text-text w-full relative z-50 shadow-sm border-b">
            <div className="container mx-auto flex items-center justify-between px-3 py-2">

                {/* LEFT SIDE MENU */}
                <div className="flex items-center relative">
                    <button
                        ref={buttonRef}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center space-x-2"
                    >
                        <span className="font-semibold text-sm sm:text-base">
                            {activePage}
                        </span>
                        <Image
                            src={menuOpen ? "/images/menu-close-icon.png" : "/images/dropdown-icon.png"}
                            alt="Menu"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                        />
                    </button>

                    {menuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute top-full -left-2 sm:-left-5 mt-1 w-36 bg-white border border-gray-300 rounded shadow-lg z-50"
                        >
                            <Link href="/admin/sent-challan" onClick={() => handlePageChange("Sent Challan")} className="block px-3 py-2 hover:bg-gray-100">Sent Challan</Link>
                            <Link href="/admin/challan" onClick={() => handlePageChange("Challan")} className="block px-3 py-2 hover:bg-gray-100">Challan</Link>
                            <Link href="/admin/new-rule" onClick={() => handlePageChange("New Rules")} className="block px-3 py-2 hover:bg-gray-100">New Rules</Link>
                            <Link href="/admin/add-other" onClick={() => handlePageChange("Add Other")} className="block px-3 py-2 hover:bg-gray-100">Add Other</Link>
                        </div>
                    )}
                </div>

                {/* SEARCH BAR DESKTOP */}
                <form onSubmit={handleSearch} className="flex-1 mx-4 hidden sm:flex">
                    <div className="flex items-center border border-gray-300 rounded-md w-full">
                        <Image
                            src="/images/search-icon.png"
                            alt="Search"
                            width={20}
                            height={20}
                            className="w-5 h-5 ml-2"
                        />
                        <input
                            type="text"
                            placeholder="Search bike number..."
                            className="w-full px-3 py-1 text-black rounded-md pl-4 outline-none"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                </form>

                {/* PROFILE / LOGIN */}
                <div className="relative ml-4" ref={profileRef}>
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                {/* PFP LOGIC: First Letter of Name */}
                                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm uppercase">
                                    {officerName ? officerName.charAt(0) : "O"}
                                </div>
                                
                                <div className="flex flex-col text-left leading-tight hidden sm:flex">
                                    <span className="font-semibold text-sm">{officerName}</span>
                                    <span className="text-xs text-gray-500">{officerRank}</span>
                                </div>
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-50">
                                    <div className="px-4 py-2 border-b sm:hidden">
                                        <p className="font-bold text-sm">{officerName}</p>
                                        <p className="text-xs text-gray-500">{officerRank}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium text-sm transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        // LOGIN BUTTON (Redirects to /admin/login)
                        <button 
                            onClick={handleLoginRedirect}
                            className="flex items-center space-x-2 text-sm font-semibold text-text hover:text-blue-800"
                        >
                            <span>SignUp</span>
                            <Image
                                src="/images/enter-icon.png"
                                alt="Signup"
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full"
                            />
                        </button>
                    )}
                </div>
            </div>

            {/* MOBILE SEARCH */}
            <div className="sm:hidden px-3 pb-3">
                <form onSubmit={handleSearch}>
                    <div className="flex items-center border border-gray-300 rounded-md">
                        <Image
                            src="/images/search-icon.png"
                            alt="Search"
                            width={20}
                            height={20}
                            className="w-5 h-5 ml-2"
                        />
                        <input
                            type="text"
                            placeholder="Search bike number..."
                            className="w-full px-3 py-1 text-black rounded-md pl-4 outline-none"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                </form>
            </div>
        </nav>
    );
}