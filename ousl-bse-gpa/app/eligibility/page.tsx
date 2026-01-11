"use client";
import { useState, useEffect } from "react";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { checkEligibility, EligibilityResult } from "@/lib/eligibility-check";
import { Course, Program, StudentProfile } from "@/types";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Eligibility() {
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [results, setResults] = useState<EligibilityResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Data
    useEffect(() => {
        if (!user) return;

        const unsubCourses = onSnapshot(collection(db, "courses"), (snap) => {
            const data: Course[] = [];
            snap.forEach(d => {
                const c = { id: d.id, ...d.data() } as Course;
                if (c.active !== false) data.push(c);
            });
            setCourses(data);
        });

        const unsubPrograms = onSnapshot(collection(db, "programs"), (snap) => {
            const data: Program[] = [];
            snap.forEach(d => data.push({ id: d.id, ...d.data() } as Program));
            // Sort by level usually
            data.sort((a, b) => a.level - b.level);
            setPrograms(data);
        });

        const fetchProfile = async () => {
            // Assume user profile is stored in 'users' collection with 'completedCourses'
            // If not fully implemented, we might need a mock or fallback
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setStudentProfile({
                        uid: user.uid,
                        email: user.email!,
                        displayName: data.name || "Student",
                        enrolledProgramId: data.programId || "BSE",
                        completedCourses: data.completedCourses || [],
                        completedSubjects: data.completedSubjects || [],
                        academicProgress: data.academicProgress,
                        eligibilitySnapshot: data.eligibilitySnapshot
                    });
                } else {
                    // Fallback for demo if no profile exists yet
                    setStudentProfile({
                        uid: user.uid,
                        email: user.email!,
                        displayName: "Student",
                        enrolledProgramId: "BSE",
                        completedCourses: [],
                        completedSubjects: []
                    });
                }
            } catch (e) {
                console.error("Error fetching profile", e);
            }
        };

        fetchProfile();

        return () => {
            unsubCourses();
            unsubPrograms();
        };
    }, [user]);

    // Calculate Eligibility & Save Snapshot
    useEffect(() => {
        if (studentProfile && courses.length > 0 && programs.length > 0) {
            const eligibility = checkEligibility(studentProfile, courses, programs);
            setResults(eligibility);
            setLoading(false);

            // Save Snapshot to Firestore
            const saveSnapshot = async () => {
                const snapshot: Record<string, any> = { checkedAt: new Date().toISOString() };
                eligibility.forEach(res => {
                    snapshot[res.programId] = {
                        eligible: res.isEligible,
                        reasons: res.missingRequirements
                    };
                });

                try {
                    await updateDoc(doc(db, "users", user!.uid), {
                        eligibilitySnapshot: snapshot
                    });
                } catch (e) {
                    console.error("Error saving eligibility snapshot", e);
                }
            };
            saveSnapshot();
        }
    }, [studentProfile, courses, programs]);

    if (loading) return <div className="p-12 text-center">Loading eligibility data...</div>;

    if (!studentProfile?.academicProgress) return (
        <Protected>
            <main className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="container mx-auto px-6 py-20 text-center">
                    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Calculation Required</h2>
                        <p className="text-slate-600 mb-8">
                            Eligibility cannot be checked until you calculate your Credit Deficiency.
                            Please use the tool below first.
                        </p>
                        <a href="/credit-deficiency" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                            Go to Credit Deficiency
                        </a>
                    </div>
                </div>
            </main>
        </Protected>
    );

    return (
        <Protected>
            <main className="min-h-screen bg-slate-50 pb-20">
                <Navbar />
                <div className="container mx-auto px-6 py-12">
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Qualification Eligibility</h1>
                        <p className="text-slate-600 text-lg">Independent evaluation for Diploma, HND, and Degree based on BSE Guidebook.</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800 text-white">
                                    <tr>
                                        <th className="px-8 py-5 font-bold uppercase tracking-wider">Program</th>
                                        <th className="px-8 py-5 font-bold uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-5 font-bold uppercase tracking-wider">Analysis / Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {["diploma", "hnd", "degree"].map((type) => {
                                        const result = results.find(r => r.programId === type);
                                        if (!result) return null;

                                        return (
                                            <tr key={type} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${type === "degree" ? "bg-blue-100 text-blue-600" :
                                                                type === "hnd" ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
                                                            }`}>
                                                            {type === "degree" ? "🎓" : type === "hnd" ? "📜" : "📝"}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800 uppercase tracking-tight">
                                                                {type === "degree" ? "BSE Honours" : result.programName}
                                                            </p>
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                                {result.creditsRequired} Credits Req.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    {result.isEligible ? (
                                                        <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                            ELIGIBLE
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold text-sm">
                                                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                                            NOT ELIGIBLE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-8">
                                                    {result.missingRequirements.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {result.missingRequirements.map((req, i) => (
                                                                <div key={i} className="flex gap-2 text-sm text-slate-600 font-medium">
                                                                    <span className="text-red-400">•</span>
                                                                    {req}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-100 inline-block">
                                                            ✅ Qualification requirements satisfied.
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-12 bg-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Official Sync Status</h3>
                                <p className="text-blue-100 leading-relaxed font-medium">
                                    Your eligibility is evaluated in real-time based on your **Credit Deficiency** data.
                                    This ensures zero discrepancy between your tracking and official qualification checks.
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Data Source: Firestore</p>
                                    <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                </div>
                                <div className="text-3xl font-black mb-1">
                                    {studentProfile.academicProgress?.earnedCredits || 0} CREDITS
                                </div>
                                <p className="text-sm text-blue-200 font-medium">Recorded on: {new Date(studentProfile.academicProgress?.lastUpdated || new Date()).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                    </div>
                </div>
            </main>
        </Protected>
    );
}
