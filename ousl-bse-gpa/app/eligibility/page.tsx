"use client";
import { useState } from "react";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import { BSE_SUBJECTS } from "@/lib/bseSubjects";
import { checkEligibility } from "@/lib/eligibility";
import { StudentResult, Grade } from "@/lib/gpa";

export default function Eligibility() {
    const [results, setResults] = useState<StudentResult[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<Grade>("A");

    const handleAddResult = () => {
        if (!selectedSubject) return;
        const subject = BSE_SUBJECTS.find(s => s.code === selectedSubject);
        if (!subject) return;

        const newResult: StudentResult = {
            subjectCode: subject.code,
            grade: selectedGrade,
            credits: subject.credits,
            gpaEligible: subject.gpaEligible
        };

        const filtered = results.filter(r => r.subjectCode !== subject.code);
        setResults([...filtered, newResult]);
    };

    const eligibility = checkEligibility(results);

    return (
        <Protected>
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6">Graduation Eligibility</h1>

                    <div className="bg-white p-6 rounded shadow mb-6">
                        <h2 className="text-xl font-semibold mb-4">Add Completed Subjects</h2>
                        <div className="flex gap-4 mb-4">
                            <select className="input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                <option value="">Select Subject</option>
                                {BSE_SUBJECTS.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                            </select>
                            <select className="input w-32" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value as Grade)}>
                                {["A", "B", "C", "D", "F"].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <button onClick={handleAddResult} className="btn">Add</button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Status</h2>
                        {eligibility.isEligibleForGraduation ? (
                            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                <h3 className="font-bold text-lg">ELIGIBLE FOR GRADUATION</h3>
                                <p>Congratulations! You have met all the requirements.</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                <h3 className="font-bold text-lg">NOT ELIGIBLE</h3>
                                <ul className="list-disc pl-5 mt-2">
                                    {eligibility.deficiency > 0 && <li>Missing {eligibility.deficiency} credits</li>}
                                    {eligibility.missingCompulsory.length > 0 && <li>Missing {eligibility.missingCompulsory.length} compulsory subjects</li>}
                                </ul>
                            </div>
                        )}

                        {eligibility.blockedSubjects.length > 0 && (
                            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                                <h3 className="font-bold">Blocked Subjects (Prerequisites Missing)</h3>
                                <p className="text-sm">You cannot register for these yet:</p>
                                <ul className="list-disc pl-5">
                                    {eligibility.blockedSubjects.map(code => (
                                        <li key={code}>{code} - {BSE_SUBJECTS.find(s => s.code === code)?.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </Protected>
    );
}
