"use client";

import React, { useState } from "react";
import Image from "next/image";

interface SignUpModalProps {
    closeModal: () => void;
    goBackToLogin: () => void;
}

export default function SignUpModal({ closeModal, goBackToLogin }: SignUpModalProps) {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [bikeNumber, setBikeNumber] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    // FILE INPUTS
    const [bikeCopy, setBikeCopy] = useState<File | null>(null);
    const [cnicFront, setCnicFront] = useState<File | null>(null);
    const [cnicBack, setCnicBack] = useState<File | null>(null);

    // Password strength checking
    function getPasswordStrength(pwd: string) {
        let score = 0;

        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        const levels = ["Very Weak", "Weak", "Normal", "Strong", "Very Strong"];
        const colors = ["#ff4d4d", "#ff944d", "#ffc107", "#4caf50", "#0d8a0d"];

        return { label: levels[score], color: colors[score] };
    }

    const strength = getPasswordStrength(password);

    // Bike number pattern: 1–3 alphabets + 1–4 numbers
    const bikeRegex = /^[A-Za-z]{1,3}[0-9]{1,4}$/;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999] px-3">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Sign Up</h2>
                    <button onClick={closeModal}>
                        <Image src="/images/menu-close-icon.png" width={20} height={20} alt="close" />
                    </button>
                </div>

                {/* EMAIL */}
                <label className="block mb-1 font-semibold">Email</label>
                <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* PHONE NUMBER */}
                <label className="block mb-1 font-semibold">Phone Number</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
                    placeholder="03XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                {/* BIKE NUMBER */}
                <label className="block mb-1 font-semibold">Bike Number</label>
                <input
                    type="text"
                    className={`w-full border rounded-md px-3 py-2 mb-3 ${
                        bikeNumber && !bikeRegex.test(bikeNumber)
                            ? "border-red-500"
                            : "border-gray-300"
                    }`}
                    placeholder="Format: ABC1234"
                    value={bikeNumber}
                    onChange={(e) => setBikeNumber(e.target.value)}
                />

                {/* UPLOAD BIKE COPY */}
                <label className="block mb-1 font-semibold">Bike Official Copy</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBikeCopy(e.target.files?.[0] || null)}
                    className="w-full mb-3"
                />

                {/* CNIC FRONT */}
                <label className="block mb-1 font-semibold">Upload CNIC Front</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCnicFront(e.target.files?.[0] || null)}
                    className="w-full mb-3"
                />

                {/* CNIC BACK */}
                <label className="block mb-1 font-semibold">Upload CNIC Back</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCnicBack(e.target.files?.[0] || null)}
                    className="w-full mb-3"
                />

                {/* PASSWORD */}
                <label className="block mb-1 font-semibold">Password</label>
                <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-1"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* PASSWORD STRENGTH */}
                {password && (
                    <p className="text-sm mb-3 font-semibold" style={{ color: strength.color }}>
                        {strength.label}
                    </p>
                )}

                {/* RE-ENTER PASSWORD */}
                <label className="block mb-1 font-semibold">Re-enter Password</label>
                <input
                    type="password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                    placeholder="Re-enter Password"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                />

                {/* TERMS */}
                <p className="text-sm mb-4">
                    By signing in you are accepting the{" "}
                    <a href="/terms" className="text-brand font-semibold hover:underline">
                        Terms & Conditions
                    </a>
                </p>

                {/* SIGN UP BUTTON */}
                <button
                    disabled={!(strength.label === "Normal" || strength.label === "Strong" || strength.label === "Very Strong")}
                    className={`w-full py-2 rounded-md font-semibold text-white ${
                        strength.label === "Normal" || strength.label === "Strong" || strength.label === "Very Strong"
                            ? "bg-primary"
                            : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                    Sign Up
                </button>

                {/* LOGIN LINK */}
                <p className="text-center mt-4">
                    Already have an account?{" "}
                    <button
                        className="text-brand font-semibold hover:underline"
                        onClick={goBackToLogin}
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}
