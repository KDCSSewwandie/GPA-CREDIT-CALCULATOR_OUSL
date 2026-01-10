"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [regNo, setRegNo] = useState("");
    const [adminCode, setAdminCode] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const role = adminCode === "ADMIN2025" ? "admin" : "student";

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                regNo: regNo,
                role: role
            });

            if (role === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard/student");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        <main className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">

                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2 text-center text-emerald-900">Create Account</h2>
                        <p className="text-center text-gray-500 mb-8">Join the OUSL BSE community</p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center animate-pulse">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                <input
                                    type="text"
                                    className="input bg-white/50 focus:bg-white transition-all"
                                    placeholder="e.g. S123456"
                                    value={regNo}
                                    onChange={(e) => setRegNo(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="input bg-white/50 focus:bg-white transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="input bg-white/50 focus:bg-white transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Code (Optional)</label>
                                <input
                                    type="text"
                                    className="input bg-white/50 focus:bg-white transition-all"
                                    placeholder="Enter code to register as Admin"
                                    value={adminCode}
                                    onChange={(e) => setAdminCode(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl text-white font-semibold shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Register
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Already have an account? <Link href="/login" className="font-semibold text-emerald-600 hover:underline">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
