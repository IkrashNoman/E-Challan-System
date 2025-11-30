/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import LoginModal from "./LoginModal";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [activePage, setActivePage] = useState<string>("Home");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false); // For logout dropdown

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null); // Ref for user dropdown
  const router = useRouter();
  const pathname = usePathname();

  // --- Auth Logic ---
  const checkAuth = () => {
    // Check if tokens exist in local storage
    const token = localStorage.getItem("accessToken");
    const email = localStorage.getItem("userEmail");
    
    if (token && email) {
      setIsLoggedIn(true);
      setUserName(email); // Display email as the username
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  };

  // Check auth on component mount
  useEffect(() => {
    checkAuth();
    
    // Optional: Listen for storage changes (if login happens in another tab)
    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    // 1. Clear Storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    
    // 2. Reset State
    setIsLoggedIn(false);
    setUserName("");
    setUserMenuOpen(false);
    
    // 3. Redirect to Home
    router.push("/");
  };
  // ------------------

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

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close Main Menu if clicked outside
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
      // Close User Logout Menu if clicked outside
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update active page based on route
  useEffect(() => {
    if (pathname === "/") setActivePage("Home");
    else if (pathname.startsWith("/contact")) setActivePage("Contact");
    else if (pathname.startsWith("/about")) setActivePage("About");
    else if (pathname.startsWith("/my-challans")) setActivePage("My Challans");
    else if (pathname.startsWith("/history")) setActivePage("History");
    else if (pathname.startsWith("/rules")) setActivePage("Rule");
    else setActivePage("404 Page");
  }, [pathname]);

  return (
    <nav className="bg-white text-text w-full relative z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-3 py-2">
        {/* LEFT SIDE: Navigation */}
        <div className="flex items-center relative">
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center space-x-2"
          >
            <span className="font-semibold text-sm sm:text-base text-black">
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
              <Link href="/" onClick={() => handlePageChange("Home")} className="block px-3 py-2 hover:bg-gray-100 text-black">Home</Link>
              <Link href="/contact" onClick={() => handlePageChange("Contact")} className="block px-3 py-2 hover:bg-gray-100 text-black">Contact</Link>

              {isLoggedIn && (
                <Link href="/my-challans" onClick={() => handlePageChange("My Challans")} className="block px-3 py-2 hover:bg-gray-100 text-black">My Challans</Link>
              )}

              <Link href="/about" onClick={() => handlePageChange("About")} className="block px-3 py-2 hover:bg-gray-100 text-black">About</Link>

              {isLoggedIn && (
                <Link href="/history" onClick={() => handlePageChange("History")} className="block px-3 py-2 hover:bg-gray-100 text-black">History</Link>
              )}

              <Link href="/rules" onClick={() => handlePageChange("Rule")} className="block px-3 py-2 hover:bg-gray-100 text-black">Rule</Link>
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

        {/* RIGHT SIDE: Auth */}
        <div>
          {!isLoggedIn ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center font-semibold space-x-2 text-black"
            >
              <span>Sign In</span>
              {/* Uses enter-icon.png for Sign In */}
              <Image
                src="/images/enter-icon.png"
                alt="Enter"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full"
              />
            </button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <span className="font-semibold text-black">{userName}</span>
                {/* Uses enter-icon.png as placeholder PFP */}
                <Image
                  src="/images/enter-icon.png"
                  alt="Profile"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full cursor-pointer"
                />
              </button>
              
              {/* Logout Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                   <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
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
              className="w-full px-3 py-1 text-black rounded-md pl-4 outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* LOGIN MODAL */}
      {isModalOpen && (
        <LoginModal 
            closeModal={() => {
                setIsModalOpen(false);
                checkAuth();
            }} 
        />
      )}
    </nav>
  );
}