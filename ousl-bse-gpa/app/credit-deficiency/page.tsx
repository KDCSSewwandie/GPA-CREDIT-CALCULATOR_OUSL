"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Protected from "@/components/Protected";
import { BSE_SUBJECTS } from "@/lib/bseSubjects";
import { checkEligibility } from "@/lib/eligibility";
import { StudentResult, Grade } from "@/lib/gpa";

export default function CreditDeficiency() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<StudentResult[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const grades = data.grades || {};

                    // Convert Firestore grades map to StudentResult array
                    const mappedResults: StudentResult[] = [];

                    // Iterate through BSE_SUBJECTS to find matches in saved grades
                    // We use BSE_SUBJECTS as the source of truth for metadata (credits, etc.)
                    BSE_SUBJECTS.forEach(subject => {
                        // Check if grade exists for this subject code (or ID if they match)
                        // In our new system, ID often equals Code for static subjects
                        const grade = grades[subject.code] || grades[subject.code.toLowerCase()];

                        if (grade) {
                            mappedResults.push({
                                subjectCode: subject.code,
                                grade: grade as Grade,
                                credits: subject.credits,
                                gpaEligible: subject.gpaEligible
                            });
                        }
                    });

                    setResults(mappedResults);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const eligibility = checkEligibility(results);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Analyzing your credits...</p>
        </div>
    );

    return (
        <Protected>
            <main className="min-h-screen bg-gray-50 pb-20">
                <Navbar />
                <div className="container mx-auto px-6 py-12">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Credit Deficiency Report</h1>
                    <p className="text-slate-500 mb-8">Based on your saved grades from the GPA Calculator.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                📊 Credit Summary
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                                        <span>Earned Credits</span>
                                        <span className="font-bold text-gray-800">{eligibility.earnedCredits} / {eligibility.requiredCredits}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min((eligibility.earnedCredits / eligibility.requiredCredits) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                                    <span className="text-blue-800 font-medium">Deficiency</span>
                                    <span className={`text-2xl font-bold ${eligibility.deficiency > 0 ? "text-red-600" : "text-green-600"}`}>
                                        {eligibility.deficiency > 0 ? eligibility.deficiency : "None"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Missing Subjects Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                ⚠️ Missing Compulsory Subjects
                            </h2>
                            {eligibility.missingCompulsory.length > 0 ? (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {eligibility.missingCompulsory.map(code => {
                                        const subject = BSE_SUBJECTS.find(s => s.code === code);
                                        return (
                                            <div key={code} className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-red-800">{code}</div>
                                                    <div className="text-xs text-red-600">{subject?.name}</div>
                                                </div>
                                                <span className="text-xs font-bold bg-white text-red-500 px-2 py-1 rounded border border-red-100">
                                                    {subject?.credits} Credits
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-green-600 bg-green-50 rounded-xl border border-green-100">
                                    <span className="text-3xl mb-2">🎉</span>
                                    <span className="font-bold">All Compulsory Subjects Completed!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </Protected>
    );
}
