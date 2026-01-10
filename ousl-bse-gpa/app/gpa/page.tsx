"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Protected from "@/components/Protected";
import { BSE_SUBJECTS } from "@/lib/bseSubjects";

type Course = {
    id: string;
    code: string;
    name: string;
    credits: number;
    level: number;
    category: string;
    prerequisites?: string[];
    isCustom?: boolean;
};

type Grade = {
    [courseId: string]: string; // "A+", "A", "B", etc.
};

const GRADE_POINTS: { [key: string]: number } = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "E": 0.0
};

export default function GPACalculator() {
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
    const [grades, setGrades] = useState<Grade>({});
    const [user, setUser] = useState<User | null>(null);
    const [gpa, setGpa] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"catalog" | "custom">("catalog");
    const [searchTerm, setSearchTerm] = useState("");
    const [customCourse, setCustomCourse] = useState({ code: "", name: "", credits: 3 });

    // Quick Add State
    const [quickAddCourseId, setQuickAddCourseId] = useState("");

    // Fetch User
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Data
    useEffect(() => {
        if (!user) return;

        // 1. Fetch Global Courses
        const unsubCourses = onSnapshot(collection(db, "courses"), async (snapshot) => {
            // Start with Static Data to ensure subjects are ALWAYS available
            const courseMap = new Map<string, Course>();

            BSE_SUBJECTS.forEach(sub => {
                courseMap.set(sub.code, {
                    ...sub,
                    id: sub.code,
                    category: sub.category as string
                });
            });

            // Overlay DB Data (if any)
            snapshot.forEach((doc) => {
                const data = doc.data();
                // If DB has this course, overwrite the static one (or add if new)
                courseMap.set(data.code || doc.id, { id: doc.id, ...data } as Course);
            });

            let coursesData = Array.from(courseMap.values());

            // 2. Fetch User Data
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.grades) setGrades(data.grades);

                    let enrolled = data.enrolledCourseIds || [];
                    if (enrolled.length === 0 && data.grades) {
                        enrolled = Object.keys(data.grades);
                    }
                    setEnrolledCourseIds(enrolled);

                    if (data.customCourses) {
                        coursesData = [...coursesData, ...data.customCourses];
                    }
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }

            // Sort by Level then Code
            coursesData.sort((a, b) => a.level - b.level || a.code.localeCompare(b.code));
            setAllCourses(coursesData);
            setLoading(false);
        });

        return () => unsubCourses();
    }, [user]);

    const handleGradeChange = (courseId: string, grade: string) => {
        setGrades(prev => ({ ...prev, [courseId]: grade }));
    };

    const saveProgress = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                grades,
                enrolledCourseIds
            }, { merge: true });
            alert("Progress saved successfully!");
        } catch (err) {
            console.error("Error saving:", err);
            alert("Failed to save progress.");
        }
        setSaving(false);
    };

    const handleEnroll = async (courseId: string) => {
        if (!courseId) return;
        if (!enrolledCourseIds.includes(courseId)) {
            const newEnrolled = [...enrolledCourseIds, courseId];
            setEnrolledCourseIds(newEnrolled);
            if (user) {
                await updateDoc(doc(db, "users", user.uid), {
                    enrolledCourseIds: arrayUnion(courseId)
                });
            }
            setQuickAddCourseId(""); // Reset dropdown
        }
    };

    const handleUnenroll = async (courseId: string) => {
        if (confirm("Remove this subject from your list? Grades will be kept but hidden.")) {
            const newEnrolled = enrolledCourseIds.filter(id => id !== courseId);
            setEnrolledCourseIds(newEnrolled);
            if (user) {
                await updateDoc(doc(db, "users", user.uid), {
                    enrolledCourseIds: arrayRemove(courseId)
                });
            }
        }
    };

    const handleAddCustomCourse = async () => {
        if (!user || !customCourse.code || !customCourse.name) return;

        const newCourse: Course = {
            id: `custom_${Date.now()}`,
            code: customCourse.code,
            name: customCourse.name,
            credits: customCourse.credits,
            level: 0,
            category: "Custom",
            isCustom: true
        };

        try {
            await setDoc(doc(db, "users", user.uid), {
                customCourses: arrayUnion(newCourse),
                enrolledCourseIds: arrayUnion(newCourse.id)
            }, { merge: true });

            setAllCourses(prev => [...prev, newCourse]);
            setEnrolledCourseIds(prev => [...prev, newCourse.id]);
            setIsAddModalOpen(false);
            setCustomCourse({ code: "", name: "", credits: 3 });
            alert("Custom subject added!");
        } catch (error) {
            console.error("Error adding custom course:", error);
            alert("Failed to add subject.");
        }
    };

    const calculateGPA = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        const myCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id) || c.isCustom);

        myCourses.forEach(course => {
            const grade = grades[course.id];
            if (grade && GRADE_POINTS[grade] !== undefined) {
                totalPoints += GRADE_POINTS[grade] * course.credits;
                totalCredits += course.credits;
            }
        });

        if (totalCredits === 0) {
            setGpa(0);
        } else {
            setGpa(Number((totalPoints / totalCredits).toFixed(2)));
        }
    };

    // Derived State
    const myCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id) || (c.isCustom && enrolledCourseIds.includes(c.id)));

    // Available courses for dropdown (excluding already enrolled)
    const availableCourses = allCourses.filter(c => !enrolledCourseIds.includes(c.id));

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Loading your academic profile...</p>
        </div>
    );

    return (
        <Protected>
            <main className="min-h-screen bg-gray-50 pb-20">
                <Navbar />
                <div className="container mx-auto px-6 py-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">My Subjects & GPA</h1>
                            <p className="text-slate-500">Manage your enrolled subjects and track performance.</p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={saveProgress}
                                disabled={saving}
                                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-all disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Progress"}
                            </button>
                            <button
                                onClick={calculateGPA}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
                            >
                                Calculate GPA
                            </button>
                        </div>
                    </div>

                    {/* GPA Display */}
                    {gpa !== null && (
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl shadow-xl text-white text-center mb-12 animate-blob">
                            <h2 className="text-2xl font-semibold mb-2">Your Current GPA</h2>
                            <div className="text-6xl font-extrabold">{gpa}</div>
                        </div>
                    )}

                    {/* My Courses Table */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden min-h-[300px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Code</th>
                                    <th className="p-4 font-semibold text-gray-600">Subject</th>
                                    <th className="p-4 font-semibold text-gray-600">Credits</th>
                                    <th className="p-4 font-semibold text-gray-600">Grade</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {myCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-800">{course.code}</td>
                                        <td className="p-4 text-gray-600">{course.name}</td>
                                        <td className="p-4 text-gray-600">{course.credits}</td>
                                        <td className="p-4">
                                            <select
                                                className={`border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${grades[course.id] ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "border-gray-300"
                                                    }`}
                                                value={grades[course.id] || ""}
                                                onChange={(e) => handleGradeChange(course.id, e.target.value)}
                                            >
                                                <option value="">Select Grade</option>
                                                {Object.keys(GRADE_POINTS).map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleUnenroll(course.id)}
                                                className="text-red-400 hover:text-red-600 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Quick Add Row */}
                                <tr className="bg-blue-50/50 border-t-2 border-blue-100 border-dashed">
                                    <td className="p-4" colSpan={2}>
                                        <select
                                            className="w-full border border-blue-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            value={quickAddCourseId}
                                            onChange={(e) => {
                                                setQuickAddCourseId(e.target.value);
                                                if (e.target.value) handleEnroll(e.target.value);
                                            }}
                                        >
                                            <option value="">+ Add a Subject...</option>
                                            {availableCourses.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.code} - {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm italic" colSpan={3}>
                                        Select a subject to add it to your list instantly.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 mb-2">Can't find your subject?</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="text-purple-600 font-semibold hover:underline"
                        >
                            Create a Custom Subject
                        </button>
                    </div>

                    {/* Add Custom Subject Modal */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">Create Custom Subject</h2>
                                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                                        <input
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            placeholder="e.g. EEI9999"
                                            value={customCourse.code}
                                            onChange={e => setCustomCourse({ ...customCourse, code: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                                        <input
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            placeholder="e.g. Advanced Programming"
                                            value={customCourse.name}
                                            onChange={e => setCustomCourse({ ...customCourse, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg p-3"
                                            value={customCourse.credits}
                                            onChange={e => setCustomCourse({ ...customCourse, credits: Number(e.target.value) })}
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddCustomCourse}
                                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg mt-4"
                                    >
                                        Create & Add Subject
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </Protected>
    );
}
