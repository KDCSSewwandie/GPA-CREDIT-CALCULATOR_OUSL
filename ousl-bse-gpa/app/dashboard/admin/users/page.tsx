"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, deleteDoc, doc, query } from "firebase/firestore";

type UserData = {
    uid: string;
    name?: string;
    email: string;
    regNo: string;
    role: string;
    status?: string;
};

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData: UserData[] = [];
            snapshot.forEach((doc) => {
                usersData.push({ uid: doc.id, ...doc.data() } as UserData);
            });
            setUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (uid: string) => {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "users", uid));
                alert("User deleted successfully");
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user");
            }
        }
    };

    if (loading) return <div className="p-8">Loading users...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500">Manage student accounts, roles, and access.</p>
                </div>
                <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-900 transition-all">
                    Export Users
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Reg No</th>
                            <th className="p-4 font-semibold text-slate-600">Email</th>
                            <th className="p-4 font-semibold text-slate-600">Role</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{user.regNo || "N/A"}</td>
                                <td className="p-4 text-slate-600">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(user.uid)}
                                        className="text-red-600 hover:underline text-sm bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-8 text-center text-slate-500">No users found.</div>
                )}
            </div>
        </div>
    );
}
