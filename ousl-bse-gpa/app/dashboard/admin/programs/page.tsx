"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Program } from "@/types";

export default function ProgramsManagement() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    const [formData, setFormData] = useState<Program>({
        name: "",
        code: "",
        level: 3,
        minCredits: 30,
        active: true,
        description: ""
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "programs"), (snapshot) => {
            const progData: Program[] = [];
            snapshot.forEach((doc) => {
                progData.push({ id: doc.id, ...doc.data() } as Program);
            });
            setPrograms(progData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        try {
            if (editingProgram && editingProgram.id) {
                await updateDoc(doc(db, "programs", editingProgram.id), { ...formData });
            } else {
                await addDoc(collection(db, "programs"), formData);
            }
            setIsModalOpen(false);
            setEditingProgram(null);
            setFormData({ name: "", code: "", level: 3, minCredits: 30, active: true, description: "" });
        } catch (error) {
            console.error("Error saving program:", error);
            alert("Failed to save program.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this program? This might affect enrolled students!")) {
            await deleteDoc(doc(db, "programs", id));
        }
    };

    const openEditModal = (prog: Program) => {
        setEditingProgram(prog);
        setFormData(prog);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingProgram(null);
        setFormData({ name: "", code: "", level: 3, minCredits: 30, active: true, description: "" });
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Degree Programs</h1>
                    <p className="text-slate-500">Manage available study programs (Diploma, HND, Degree).</p>
                </div>
                <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all">
                    + Add Program
                </button>
            </div>

            <div className="grid gap-6">
                {programs.map((prog) => (
                    <div key={prog.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-slate-800">{prog.name}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${prog.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {prog.active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-slate-500">Code: <span className="font-mono font-bold text-slate-700">{prog.code}</span> • Level: {prog.level} • Min Credits: {prog.minCredits}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => openEditModal(prog)} className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">Edit</button>
                            <button onClick={() => handleDelete(prog.id!)} className="px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">{editingProgram ? "Edit Program" : "Add Program"}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Program Name</label>
                                <input className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                                    <input className="w-full border p-2 rounded-lg" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Level (3-6)</label>
                                    <input type="number" className="w-full border p-2 rounded-lg" value={formData.level} onChange={e => setFormData({ ...formData, level: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min. Credits to Graduate</label>
                                <input type="number" className="w-full border p-2 rounded-lg" value={formData.minCredits} onChange={e => setFormData({ ...formData, minCredits: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                    <span className="text-sm font-medium text-slate-700">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
