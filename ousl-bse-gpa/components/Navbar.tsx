"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <nav className="bg-blue-900 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">OUSL BSE Academic Planner</Link>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <>
                            <Link href="/dashboard/student" className="hover:text-blue-200">Dashboard</Link>
                            <Link href="/gpa" className="hover:text-blue-200">GPA</Link>
                            <Link href="/credit-deficiency" className="hover:text-blue-200">Deficiency</Link>
                            <Link href="/eligibility" className="hover:text-blue-200">Eligibility</Link>
                            <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-blue-200">Login</Link>
                            <Link href="/register" className="bg-green-600 px-3 py-1 rounded hover:bg-green-700">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
