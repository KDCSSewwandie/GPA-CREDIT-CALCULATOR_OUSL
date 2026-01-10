"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { BSE_SUBJECTS } from "@/lib/bseSubjects";

type Course = {
    id?: string;
    code: string;
    name: string;
    credits: number;
    level: number;
    category: string;
    semester?: number;
    prerequisites?: string[];
};

export default function CourseManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    // Form State
    const [formData, setFormData] = useState<Course>({
        code: "", name: "", credits: 3, level: 3, category: "Compulsory"
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "courses"), (snapshot) => {
            const coursesData: Course[] = [];
            snapshot.forEach((doc) => {
                coursesData.push({ id: doc.id, ...doc.data() } as Course);
            });
            setCourses(coursesData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSeedData = async () => {
        if (!confirm("This will add all default BSE subjects to the database. Continue?")) return;
        setLoading(true);
        try {
            const batch = writeBatch(db);
            BSE_SUBJECTS.forEach((subject) => {
                const docRef = doc(collection(db, "courses"));
                batch.set(docRef, subject);
            });
            await batch.commit();
            alert("Courses initialized successfully!");
        } catch (error) {
            console.error("Error seeding courses:", error);
            alert("Failed to seed courses.");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this course?")) {
            await deleteDoc(doc(db, "courses", id));
        }
    };

    const handleSave = async () => {
        try {
            if (editingCourse && editingCourse.id) {
                await updateDoc(doc(db, "courses", editingCourse.id), formData);
            } else {
                await addDoc(collection(db, "courses"), formData);
            }
            setIsModalOpen(false);
            setEditingCourse(null);
            setFormData({ code: "", name: "", credits: 3, level: 3, category: "Compulsory" });
        } catch (error) {
            console.error("Error saving course:", error);
            alert("Failed to save course");
        }
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setFormData(course);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingCourse(null);
        setFormData({ code: "", name: "", credits: 3, level: 3, category: "Compulsory" });
        setIsModalOpen(true);
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
                    <p className="text-slate-500">Manage curriculum, prerequisites, and availability.</p>
                </div>
                <div className="flex gap-3">
                    {courses.length === 0 && (
                        <button onClick={handleSeedData} className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all">
                            Initialize Default Courses
                        </button>
                    )}
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
                            <th className="p-4 font-semibold text-slate-600">Credits</th>
                            <th className="p-4 font-semibold text-slate-600">Level</th>
                            <th className="p-4 font-semibold text-slate-600">Category</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{course.code}</td>
                                <td className="p-4 text-slate-600">{course.name}</td>
                                <td className="p-4">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{course.credits}</span>
                                </td>
                                <td className="p-4 text-slate-600">{course.level}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${course.category === "Compulsory" ? "bg-purple-100 text-purple-700" :
                                        course.category === "Elective" ? "bg-green-100 text-green-700" :
                                            "bg-orange-100 text-orange-700"
                                        }`}>
                                        {course.category}
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
                {courses.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-500 mb-4">No courses found in the database.</p>
                        <p className="text-sm text-slate-400">Click "Initialize Default Courses" to load the standard BSE curriculum.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">{editingCourse ? "Edit Course" : "Add New Course"}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
                                <input
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
                                <input
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-300 rounded-lg p-2"
                                        value={formData.credits}
                                        onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                                    <select
                                        className="w-full border border-slate-300 rounded-lg p-2"
                                        value={formData.level}
                                        onChange={e => setFormData({ ...formData, level: Number(e.target.value) })}
                                    >
                                        <option value={3}>Level 3</option>
                                        <option value={4}>Level 4</option>
                                        <option value={5}>Level 5</option>
                                        <option value={6}>Level 6</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Compulsory">Compulsory</option>
                                    <option value="Elective">Elective</option>
                                    <option value="Industrial Training">Industrial Training</option>
                                    <option value="Continuing Education">Continuing Education</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prerequisites (Comma separated codes)</label>
                                <input
                                    className="w-full border border-slate-300 rounded-lg p-2"
                                    placeholder="e.g. EEI3346, EEI3262"
                                    value={formData.prerequisites ? formData.prerequisites.join(", ") : ""}
                                    onChange={e => setFormData({ ...formData, prerequisites: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                                />
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
