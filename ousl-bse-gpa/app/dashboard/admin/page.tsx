"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Correction = {
    id: string;
    uid: string;
    email: string;
    subjectCode: string;
    message: string;
    status: string;
    timestamp: any;
};

export default function AdminDashboard() {
    const [corrections, setCorrections] = useState<Correction[]>([]);

    useEffect(() => {
        const fetchCorrections = async () => {
            try {
                const q = query(collection(db, "corrections"), where("status", "==", "pending"));
                const snapshot = await getDocs(q);
                setCorrections(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Correction)));
            } catch (err) {
                console.error("Error fetching corrections:", err);
            }
        };
        fetchCorrections();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await updateDoc(doc(db, "corrections", id), { status: "approved" });
            setCorrections(corrections.filter(c => c.id !== id));
        } catch (err) {
            console.error("Error approving correction:", err);
        }
    };

    return (
        <Protected>
            <main className="min-h-screen bg-slate-50 pb-20">
                <Navbar />

                {/* Admin Header */}
                <div className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="container mx-auto relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="bg-red-500 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Admin Portal</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-2">System Administration</h1>
                        <p className="text-slate-400 text-lg">Manage student requests and system settings.</p>
                    </div>
                </div>

                <div className="container mx-auto px-6 -mt-16 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                        Pending Corrections
                                    </h2>
                                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{corrections.length} Pending</span>
                                </div>

                                <div className="p-0">
                                    {corrections.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="text-6xl mb-4">✅</div>
                                            <h3 className="text-lg font-semibold text-slate-700">All Caught Up!</h3>
                                            <p className="text-slate-500">No pending correction requests found.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {corrections.map(c => (
                                                <div key={c.id} className="p-6 hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-slate-800">{c.subjectCode}</h4>
                                                            <p className="text-sm text-slate-500">{c.email}</p>
                                                        </div>
                                                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold uppercase">Pending</span>
                                                    </div>
                                                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm mb-4 border border-slate-100">
                                                        "{c.message}"
                                                    </p>
                                                    <div className="flex justify-end gap-3">
                                                        <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">Dismiss</button>
                                                        <button
                                                            onClick={() => handleApprove(c.id)}
                                                            className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
                                                        >
                                                            Approve Request
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 border border-transparent hover:border-slate-200">
                                        <span>📚</span> Manage Subjects
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 border border-transparent hover:border-slate-200">
                                        <span>👥</span> User Management
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-3 border border-transparent hover:border-slate-200">
                                        <span>⚙️</span> System Settings
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
                                <h3 className="font-bold mb-2">System Status</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span className="text-sm font-medium">Operational</span>
                                </div>
                                <p className="text-xs text-indigo-200">Last backup: 2 hours ago</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </Protected>
    );
}
