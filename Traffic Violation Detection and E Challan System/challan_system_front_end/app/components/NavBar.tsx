"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import LoginModal from "./LoginModal";

interface NavBarProps {
    isSignedIn?: boolean;
    userName?: string;
}

export default function NavBar({ isSignedIn = false, userName = "" }: NavBarProps) {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");
    const [activePage, setActivePage] = useState<string>("Home");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

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
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="bg-white text-text w-full relative z-50">
            <div className="container mx-auto flex items-center justify-between px-3 py-2">

                {/* LEFT SIDE */}
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
                            <Link href="/" onClick={() => handlePageChange("Home")} className="block px-3 py-2 hover:bg-gray-100">Home</Link>
                            <Link href="/contact" onClick={() => handlePageChange("Contact")} className="block px-3 py-2 hover:bg-gray-100">Contact</Link>

                            {isSignedIn && (
                                <Link href="/my-challans" onClick={() => handlePageChange("My Challans")} className="block px-3 py-2 hover:bg-gray-100">My Challans</Link>
                            )}

                            <Link href="/about" onClick={() => handlePageChange("About")} className="block px-3 py-2 hover:bg-gray-100">About</Link>

                            {isSignedIn && (
                                <Link href="/history" onClick={() => handlePageChange("History")} className="block px-3 py-2 hover:bg-gray-100">History</Link>
                            )}

                            <Link href="/rules" onClick={() => handlePageChange("Rule")} className="block px-3 py-2 hover:bg-gray-100">Rule</Link>
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

                {/* RIGHT SIDE */}
                <div>
                    {!isSignedIn ? (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center font-semibold space-x-2"
                        >
                            <span>Sign In</span>
                            <Image
                                src="/images/enter-icon.png"
                                alt="Enter"
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full"
                            />
                        </button>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold">{userName}</span>
                            <Image
                                src="/images/user-profile-icon.png"
                                alt="Profile"
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full"
                            />
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

            {/* LOGIN MODAL */}
            {isModalOpen && (
                <LoginModal closeModal={() => setIsModalOpen(false)} />
            )}
        </nav>
    );
}
