/* eslint-disable react-hooks/set-state-in-effect */
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

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

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
        router.push("/admin/signup");
    }

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
        else setActivePage("404 Page");
    }, [pathname]);

    return (
        <nav className="bg-white text-text w-full relative z-50">
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
                            <Link href="/admin" onClick={() => handlePageChange("Admin")} className="block px-3 py-2 hover:bg-gray-100">Admin</Link>
                            <Link href="/admin/challan" onClick={() => handlePageChange("Challan")} className="block px-3 py-2 hover:bg-gray-100">Challan</Link>
                            <Link href="/admin/new-rule" onClick={() => handlePageChange("New Rules")} className="block px-3 py-2 hover:bg-gray-100">New Rules</Link>
                            <Link href="/admin/add-member" onClick={() => handlePageChange("Add Other")} className="block px-3 py-2 hover:bg-gray-100">Add Other</Link>
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
                            className="w-full px-3 py-1 text-black rounded-md pl-4"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                </form>

                {/* PROFILE */}
                <div className="relative ml-4" ref={profileRef}>
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center space-x-2"
                    >
                        <Image
                            src="/images/user-icon.png"
                            alt="Profile"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <span className="font-medium">Off ABC</span>
                    </button>

                    {profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-50">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
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
                            className="w-full px-3 py-1 text-black rounded-md pl-4"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                </form>
            </div>
        </nav>
    );
}
