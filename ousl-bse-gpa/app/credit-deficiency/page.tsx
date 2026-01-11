"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Protected from "@/components/Protected";
import { Course } from "@/types";

export default function CreditDeficiency() {
    const [user, setUser] = useState<User | null>(null);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const REQUIRED_CREDITS = 125;

    const CATEGORY_REQUIREMENTS: Record<string, number> = {
        EEX: 45,
        EEY: 30,
        MHZ: 15,
        MHJ: 12,
        FDE: 6,
        LTE: 6
    };

    const getCategory = (code: string): string => {
        const prefix = code.substring(0, 3).toUpperCase();
        if (["EEI", "EEX", "ECX", "ECI"].includes(prefix)) return "EEX";
        if (prefix === "EEY") return "EEY";
        if (prefix === "MHZ" || prefix === "CPU") return "MHZ";
        if (prefix === "MHJ" || prefix === "MEZ") return "MHJ";
        if (prefix === "FDE") return "FDE";
        if (prefix === "LTE") return "LTE";
        return "OTHER";
    };

    const calculateCategoryProgress = (selectedIds: string[]) => {
        const progress: Record<string, any> = {};
        Object.keys(CATEGORY_REQUIREMENTS).forEach(cat => {
            const completed = allCourses
                .filter(c => selectedIds.includes(c.id!) && getCategory(c.code) === cat)
                .reduce((sum, c) => sum + c.credits, 0);

            progress[cat] = {
                completed,
                required: CATEGORY_REQUIREMENTS[cat],
                remaining: Math.max(0, CATEGORY_REQUIREMENTS[cat] - completed)
            };
        });
        return progress;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch All Courses
                const coursesSnap = await getDoc(doc(db, "system", "config")); // or collection
                // For simplicity assuming fetching from 'courses' collection is better
                // But we already have the pattern in GPA calculator. Let's use that.
                const { collection, getDocs } = await import("firebase/firestore");
                const snap = await getDocs(collection(db, "courses"));
                const coursesData: Course[] = [];
                snap.forEach(d => {
                    const c = { id: d.id, ...d.data() } as Course;
                    if (c.active !== false) coursesData.push(c);
                });
                setAllCourses(coursesData.sort((a, b) => a.level - b.level));

                // Fetch User Progress
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setCompletedCourseIds(userSnap.data().completedCourses || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleToggleCourse = async (courseId: string) => {
        if (!user) return;
        const isCompleted = completedCourseIds.includes(courseId);

        try {
            const course = allCourses.find(c => c.id === courseId);
            if (!course) return;

            let newIds: string[];
            let newSubjects: any[];

            // Fetch current profile to ensure we merge correctly if needed, or use local state
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            const currentSubjects = userSnap.exists() ? (userSnap.data().completedSubjects || []) : [];

            if (isCompleted) {
                newIds = completedCourseIds.filter(id => id !== courseId);
                newSubjects = currentSubjects.filter((s: any) => s.code !== course.code);
            } else {
                newIds = [...completedCourseIds, courseId];
                newSubjects = [...currentSubjects, {
                    code: course.code,
                    name: course.name,
                    credits: course.credits,
                    level: course.level,
                    category: course.category,
                    status: "Completed"
                }];
            }

            setCompletedCourseIds(newIds);

            // Re-calculate credits for snapshot
            const newEarned = allCourses
                .filter(c => newIds.includes(c.id!))
                .reduce((sum, c) => sum + c.credits, 0);

            const categoryProgress = calculateCategoryProgress(newIds);

            await updateDoc(userRef, {
                completedCourses: newIds, // Keep for backward compatibility/GPA
                completedSubjects: newSubjects, // NEW: Central source for Eligibility
                academicProgress: {
                    earnedCredits: newEarned,
                    remainingCredits: Math.max(0, REQUIRED_CREDITS - newEarned),
                    categoryProgress: categoryProgress,
                    lastUpdated: new Date().toISOString()
                }
            });
        } catch (err) {
            console.error("Error updating progress:", err);
        }
    };

    const earnedCredits = allCourses
        .filter(c => completedCourseIds.includes(c.id!))
        .reduce((sum, c) => sum + c.credits, 0);

    const deficiency = Math.max(0, REQUIRED_CREDITS - earnedCredits);
    const categoryProgress = calculateCategoryProgress(completedCourseIds);

    const filteredCatalog = allCourses.filter(c =>
        !completedCourseIds.includes(c.id!) &&
        (c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-12 text-center">Loading...</div>;

    return (
        <Protected>
            <main className="min-h-screen bg-slate-50 pb-20">
                <Navbar />
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-4">Credit Deficiency Checker</h1>
                            <p className="text-slate-600 text-lg max-w-2xl">
                                Track your progress towards the 125-credit graduation requirement and category-specific minimums.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex gap-8 items-center min-w-[300px]">
                            <div className="text-center border-r border-slate-100 pr-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                                <p className="text-3xl font-black text-blue-600">{earnedCredits}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Deficiency</p>
                                <p className={`text-3xl font-black ${deficiency > 0 ? "text-red-500" : "text-green-500"}`}>
                                    {deficiency}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Selector Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span>📚</span> Subject Catalog
                                </h3>
                                <div className="relative mb-6">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search subjects..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredCatalog.map(course => (
                                        <div key={course.id} className="group flex justify-between items-center p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-800">{course.code}</p>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black">{getCategory(course.code)}</span>
                                                </div>
                                                <p className="text-sm text-slate-500">{course.name} ({course.credits} Credits)</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleCourse(course.id!)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                                            >
                                                Mark Completed
                                            </button>
                                        </div>
                                    ))}
                                    {filteredCatalog.length === 0 && (
                                        <p className="text-center py-8 text-slate-400 italic">No remaining subjects found matching your search.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span>✅</span> Completed
                                </h3>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {allCourses.filter(c => completedCourseIds.includes(c.id!)).map(course => (
                                        <div key={course.id} className="p-3 bg-green-50 border border-green-100 rounded-xl flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-green-600">{course.code}</p>
                                                <p className="text-sm text-slate-700 font-medium truncate max-w-[150px]">{course.name}</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleCourse(course.id!)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {completedCourseIds.length === 0 && (
                                        <div className="text-center py-12 px-4">
                                            <div className="text-4xl mb-4">📝</div>
                                            <p className="text-slate-400 text-sm">No subjects completed yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-blue-600 p-6 rounded-2xl shadow-xl text-white">
                                <h4 className="font-bold mb-2">Graduation Status</h4>
                                {deficiency === 0 ? (
                                    <div className="flex items-center gap-2 text-blue-100 italic">
                                        <span>🎉</span> You have met the credit requirement!
                                    </div>
                                ) : (
                                    <div className="text-blue-100">
                                        You need <span className="text-white font-bold text-xl">{deficiency}</span> more credits to graduate.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category Analysis Table Section */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold uppercase tracking-wider">Category-Wise Analysis</h3>
                            <div className="flex gap-4 text-xs font-bold">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Satisfied</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Deficient</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Required</th>
                                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Completed</th>
                                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Remaining</th>
                                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estimates</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {Object.entries(categoryProgress).map(([cat, data]: [string, any]) => {
                                        const isSatisfied = data.remaining === 0;
                                        const minSubjects = Math.ceil(data.remaining / 3); // Average 3 credits per subject

                                        return (
                                            <tr key={cat} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <span className="font-bold text-slate-800">{cat}</span>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        {cat === "EEX" ? "Engineering Core" :
                                                            cat === "EEY" ? "Projects/Industrial" :
                                                                cat === "MHZ" ? "Mathematics" :
                                                                    cat === "MHJ" ? "Management" :
                                                                        cat === "FDE" ? "English" : "Professional Comm."}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-center font-bold text-slate-600">{data.required}</td>
                                                <td className="px-8 py-6 text-center font-bold text-blue-600">{data.completed}</td>
                                                <td className="px-8 py-6 text-center font-bold text-red-500">{data.remaining}</td>
                                                <td className="px-8 py-6 text-center">
                                                    {isSatisfied ? (
                                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">✅ Satisfied</span>
                                                    ) : (
                                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">❌ Deficient</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    {!isSatisfied && (
                                                        <p className="text-xs text-slate-500 italic">
                                                            ~ At least <span className="font-bold text-slate-700">{minSubjects}</span> more subjects needed
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50 p-8 border-t border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Overall Status</p>
                                    <h4 className="text-2xl font-black text-slate-800">
                                        {deficiency === 0 && Object.values(categoryProgress).every((v: any) => v.remaining === 0) ? (
                                            <span className="text-green-600 flex items-center gap-2">🎉 Requirements Fully Satisfied</span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-2">❌ Credit Deficient</span>
                                        )}
                                    </h4>
                                </div>
                                <div className="flex gap-12">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Remaining</p>
                                        <p className="text-2xl font-black text-slate-800">{deficiency}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Min. Total Subs</p>
                                        <p className="text-2xl font-black text-slate-800">{Math.ceil(deficiency / 3)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Protected>
    );
}
