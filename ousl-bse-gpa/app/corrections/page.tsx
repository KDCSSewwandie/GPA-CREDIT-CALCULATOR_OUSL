"use client";
import { useState } from "react";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { BSE_SUBJECTS } from "@/lib/bseSubjects";

export default function Corrections() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        try {
            await addDoc(collection(db, "corrections"), {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                subjectCode: subject,
                message: message,
                status: "pending",
                timestamp: new Date()
            });
            setStatus("Request submitted successfully!");
            setSubject("");
            setMessage("");
        } catch (err) {
            setStatus("Error submitting request. Make sure you are logged in and Firebase is configured.");
        }
    };

    return (
        <Protected>
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6">Request Correction</h1>
                    <div className="bg-white p-6 rounded shadow max-w-lg">
                        {status && <p className={`mb-4 ${status.includes("Error") ? "text-red-600" : "text-green-600"}`}>{status}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-1 font-semibold">Subject</label>
                                <select className="input" value={subject} onChange={e => setSubject(e.target.value)} required>
                                    <option value="">Select Subject</option>
                                    {BSE_SUBJECTS.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Reason for Correction</label>
                                <textarea
                                    className="input h-32"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Describe the issue..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn w-full">Submit Request</button>
                        </form>
                    </div>
                </div>
            </main>
        </Protected>
    );
}
