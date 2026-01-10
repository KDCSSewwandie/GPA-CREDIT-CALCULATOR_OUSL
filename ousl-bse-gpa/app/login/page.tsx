"use client";
import { useState, useEffect, Suspense } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export function LoginForm({ isEmbedded = false }: { isEmbedded?: boolean }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [role, setRole] = useState<"student" | "admin">("student");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam === "admin") {
            setRole("admin");
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (role === "admin") {
                router.push("/dashboard/admin");
            } else {
                router.push("/dashboard/student");
            }
        } catch (err: unknown) {
            console.error(err);
            setError("Invalid email or password");
        }
    };

    const isStudent = role === "student";

    // If embedded, we don't want the full page layout wrapper
    const Wrapper = isEmbedded ? "div" : "main";
    const wrapperClasses = isEmbedded
        ? "w-full"
        : `min-h-screen flex flex-col transition-colors duration-500 ${isStudent ? "bg-gradient-to-br from-blue-50 to-indigo-100" : "bg-gradient-to-br from-slate-100 to-slate-300"}`;

    return (
        <Wrapper className={wrapperClasses}>
            {!isEmbedded && <Navbar />}
            <div className={`flex-grow flex items-center justify-center ${!isEmbedded ? "p-6" : ""}`}>
                <div className={`bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden ${isEmbedded ? "mx-auto" : ""}`}>

                    <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob ${isStudent ? "bg-blue-300" : "bg-slate-400"}`}></div>
                    <div className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 ${isStudent ? "bg-purple-300" : "bg-gray-400"}`}></div>

                    <div className="relative z-10">
                        <h2 className={`text-3xl font-bold mb-2 text-center ${isStudent ? "text-blue-900" : "text-slate-800"}`}>
                            {isStudent ? "Student Portal" : "Admin Portal"}
                        </h2>
                        <p className="text-center text-gray-500 mb-8">Please enter your details to sign in</p>

                        {/* Role Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 relative">
                            <div className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${isStudent ? "left-1" : "left-[calc(50%-4px)] translate-x-full"}`}></div>
                            <button
                                onClick={() => setRole("student")}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${isStudent ? "text-blue-900" : "text-gray-500"}`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => setRole("admin")}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${!isStudent ? "text-slate-900" : "text-gray-500"}`}
                            >
                                Admin
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center animate-pulse">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
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
                            <button
                                type="submit"
                                className={`w-full py-3 rounded-xl text-white font-semibold shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${isStudent ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30" : "bg-gradient-to-r from-slate-700 to-slate-900 hover:shadow-slate-500/30"}`}
                            >
                                Sign In
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don&apos;t have an account? <Link href="/register" className={`font-semibold hover:underline ${isStudent ? "text-blue-600" : "text-slate-700"}`}>Register Now</Link>
                        </p>
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
