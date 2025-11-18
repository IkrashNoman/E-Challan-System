"use client";

import React, { useState } from "react";
import Image from "next/image";
import SignUpModal from "./SignUpModal";

interface LoginModalProps {
    closeModal: () => void;
}

export default function LoginModal({ closeModal }: LoginModalProps) {
    const [showSignup, setShowSignup] = useState(false);
    const [emailOrName, setEmailOrName] = useState("");
    const [password, setPassword] = useState("");

    if (showSignup) {
        return <SignUpModal closeModal={closeModal} goBackToLogin={() => setShowSignup(false)} />;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999] px-3">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Login In</h2>
                    <button onClick={closeModal}>
                        <Image src="/images/menu-close-icon.png" width={20} height={20} alt="close" />
                    </button>
                </div>

                {/* EMAIL / NAME / BIKE NUMBER */}
                <label className="block mb-1 font-semibold">Email / Name / Bike Number</label>
                <input
                    type="text"
                    value={emailOrName}
                    onChange={(e) => setEmailOrName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                    placeholder="Enter Email / Name / Bike Number"
                />

                {/* PASSWORD */}
                <label className="block mb-1 font-semibold">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                    placeholder="Enter Password"
                />

                <button className="text-primary text-sm mb-4 hover:underline">
                    Forget Password?
                </button>

                {/* LOGIN BUTTON */}
                <button className="bg-primary text-white w-full py-2 rounded-md font-semibold">
                    Sign In
                </button>

                {/* SIGNUP LINK */}
                <p className="text-center mt-4">
                    Don’t have an account?{" "}
                    <button
                        className="text-brand font-semibold hover:underline"
                        onClick={() => setShowSignup(true)}
                    >
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
}
