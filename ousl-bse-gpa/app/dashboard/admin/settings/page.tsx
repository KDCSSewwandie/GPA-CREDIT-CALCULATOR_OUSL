"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { INITIAL_COURSES, INITIAL_PROGRAMS } from "@/lib/data/initial-courses";

export default function AdminSettings() {
    const [loading, setLoading] = useState(false);

    const handleSeedData = async () => {
        if (!confirm("This will overwrite/add the initial BSE Guidebook data (Programs & Courses). Continue?")) return;
        setLoading(true);

        try {
            const batch = writeBatch(db);

            // Seed Programs
            console.log("Seeding Programs...");
            INITIAL_PROGRAMS.forEach((prog) => {
                const progRef = doc(db, "programs", prog.id);
                batch.set(progRef, prog);
            });

            // Seed Courses
            // Note: If ID is not specified in initial data, we usually let Firestore auto-generate, 
            // but for idempotency in seeding, we might want to use the code as ID or check existence.
            // For now, we'll delete and re-add or just set using code as ID to prevent duplicates if useful.
            // Let's use `code` as the document ID for courses to prevent duplicates easily.
            console.log("Seeding Courses...");
            INITIAL_COURSES.forEach((course) => {
                const courseRef = doc(db, "courses", course.code); // Use Code as ID
                batch.set(courseRef, course);
            });

            await batch.commit();
            alert("System seeded successfully with BSE Guidebook data!");
        } catch (error) {
            console.error("Error seeding data:", error);
            alert("Failed to seed data. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">System Settings</h1>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Data Management</h2>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                        <h3 className="font-semibold text-slate-700">Initialize System Data</h3>
                        <p className="text-sm text-slate-500">
                            Loads the default BSE Guidebook 2025/2026 data (Diploma, HND, Degree programs and courses).
                            <br />
                            <span className="text-red-600 font-bold">Warning: This may overwrite existing course definitions.</span>
                        </p>
                    </div>
                    <button
                        onClick={handleSeedData}
                        disabled={loading}
                        className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${loading ? "bg-slate-400" : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30"
                            }`}
                    >
                        {loading ? "Seeding..." : "Seed Database"}
                    </button>
                </div>
            </div>
        </div>
    );
}
