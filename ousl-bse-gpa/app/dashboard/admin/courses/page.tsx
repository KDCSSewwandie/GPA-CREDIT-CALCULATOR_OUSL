"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { Course, Program } from "@/types";

export default function CourseManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Form State
    const [formData, setFormData] = useState<Course>({
        code: "",
        name: "",
        credits: 3,
        level: 3,
        category: "Compulsory",
        prerequisites: [],
        programIds: [],
        isGpa: true,
        priorityLevel: 1,
        active: false // New courses default to Inactive until published
    });

    useEffect(() => {
        // Fetch Courses
        const unsubCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
            const coursesData: Course[] = [];
            snapshot.forEach((doc) => {
                coursesData.push({ id: doc.id, ...doc.data() } as Course);
            });
            coursesData.sort((a, b) => a.code.localeCompare(b.code));
            setCourses(coursesData);
        });

        // Fetch Programs
        const unsubPrograms = onSnapshot(collection(db, "programs"), (snapshot) => {
            const progData: Program[] = [];
            snapshot.forEach((doc) => {
                progData.push({ id: doc.id, ...doc.data() } as Program);
            });
            setPrograms(progData);
            setLoading(false);
        });

        return () => {
            unsubCourses();
            unsubPrograms();
        };
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this course?")) {
            await deleteDoc(doc(db, "courses", id));
        }
    };

    const handleSave = async () => {
        try {
            // Use Code as ID if new, or existing ID
            const dataToSave = { ...formData };

            if (editingCourse && editingCourse.id) {
                await updateDoc(doc(db, "courses", editingCourse.id), dataToSave);
            } else {
                // For new docs, let's try to use the code as ID if possible, or auto-id
                // But Firestore setDoc needs an ID. addDoc makes auto-ID.
                // Consistent with seeding, let's use addDoc but ideally we check for existing code.
                await addDoc(collection(db, "courses"), dataToSave);
            }
            setIsModalOpen(false);
            setEditingCourse(null);
            resetForm();
        } catch (error) {
            console.error("Error saving course:", error);
            alert("Failed to save course");
        }
    };

    const resetForm = () => {
        setFormData({
            code: "", name: "", credits: 3, level: 3, category: "Compulsory",
            prerequisites: [], programIds: [], isGpa: true, priorityLevel: 1, active: false
        });
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            ...course,
            programIds: course.programIds || [] // Ensure array exists
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingCourse(null);
        resetForm();
        setIsModalOpen(true);
    };

    const toggleProgram = (progId: string) => {
        setFormData(prev => {
            const current = prev.programIds || [];
            if (current.includes(progId)) {
                return { ...prev, programIds: current.filter(id => id !== progId) };
            } else {
                return { ...prev, programIds: [...current, progId] };
            }
        });
    };

    const filteredCourses = courses.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading courses...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Course Management</h1>
                    <p className="text-slate-500">Manage curriculum, prerequisites, and programs.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={openAddModal} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all flex items-center gap-2">
                        <span>+</span> Add New Course
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4">
                <div className="flex-grow relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by code or name..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Code</th>
                            <th className="p-4 font-semibold text-slate-600">Course Name</th>
                            <th className="p-4 font-semibold text-slate-600">Level</th>
                            <th className="p-4 font-semibold text-slate-600">Programs</th>
                            <th className="p-4 font-semibold text-slate-600">GPA?</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{course.code}</td>
                                <td className="p-4 text-slate-600">
                                    <div className="font-medium">{course.name}</div>
                                    <div className="text-xs text-slate-400">{course.credits} Credits • {course.category}</div>
                                </td>
                                <td className="p-4 text-slate-600">{course.level}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {course.programIds?.map(pid => {
                                            const prog = programs.find(p => p.id === pid || p.code === pid || (p as any).docId === pid);
                                            // Handle various ID mismatches if any. Ideally programIds matches Program.id
                                            return (
                                                <span key={pid} className="text-[10px] uppercase tracking-wider bg-slate-100 px-1 rounded border border-slate-200">
                                                    {prog ? prog.code : pid}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {course.isGpa ? (
                                        <span className="text-green-600 font-bold text-xs">✔ GPA</span>
                                    ) : (
                                        <span className="text-slate-400 text-xs">Non-GPA</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${course.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {course.active !== false ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => openEditModal(course)} className="text-slate-400 hover:text-blue-600 mr-3">✏️</button>
                                    <button onClick={() => handleDelete(course.id!)} className="text-slate-400 hover:text-red-600">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
                        <h2 className="text-2xl font-bold mb-6">{editingCourse ? "Edit Course" : "Add New Course"}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                                    <input className="w-full border p-2 rounded-lg" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                                    <input className="w-full border p-2 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
                                        <input type="number" className="w-full border p-2 rounded-lg" value={formData.credits} onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                                        <select className="w-full border p-2 rounded-lg" value={formData.level} onChange={e => setFormData({ ...formData, level: Number(e.target.value) })}>
                                            <option value={3}>Level 3</option>
                                            <option value={4}>Level 4</option>
                                            <option value={5}>Level 5</option>
                                            <option value={6}>Level 6</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select className="w-full border p-2 rounded-lg" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                                        <option value="Compulsory">Compulsory</option>
                                        <option value="Elective">Elective</option>
                                        <option value="Industrial Training">Industrial Training</option>
                                        <option value="Continuing Education">Continuing Education</option>
                                        <option value="Mandatory">Mandatory</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Eligible Programs</label>
                                    <div className="space-y-2 border p-3 rounded-lg max-h-32 overflow-y-auto">
                                        {programs.map(prog => (
                                            <label key={prog.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.programIds?.includes(prog.id!)}
                                                    onChange={() => toggleProgram(prog.id!)}
                                                />
                                                <span className="text-sm">{prog.name} ({prog.code})</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority (1=High)</label>
                                        <input type="number" className="w-full border p-2 rounded-lg" value={formData.priorityLevel} onChange={e => setFormData({ ...formData, priorityLevel: Number(e.target.value) })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prerequisites (Codes)</label>
                                    <input
                                        className="w-full border p-2 rounded-lg"
                                        placeholder="Comma sep: EEI3346, EEI3262"
                                        value={formData.prerequisites ? formData.prerequisites.join(", ") : ""}
                                        onChange={e => setFormData({ ...formData, prerequisites: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                                    />
                                </div>

                                <div className="flex flex-col gap-2 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.isGpa} onChange={e => setFormData({ ...formData, isGpa: e.target.checked })} />
                                        <span className="text-sm font-medium text-slate-700">Calculate in GPA</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} />
                                        <span className="text-sm font-medium text-slate-700">Active Course</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Course</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
