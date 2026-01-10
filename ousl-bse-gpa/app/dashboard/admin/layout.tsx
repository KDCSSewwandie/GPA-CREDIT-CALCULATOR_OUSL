"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { name: "Dashboard", href: "/dashboard/admin", icon: "📊" },
        { name: "User Management", href: "/dashboard/admin/users", icon: "👥" },
        { name: "Course Management", href: "/dashboard/admin/courses", icon: "📚" },
        { name: "Reports", href: "/dashboard/admin/reports", icon: "📈" },
        { name: "Settings", href: "/dashboard/admin/settings", icon: "⚙️" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-20"
                    } bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-30`}
            >
                <div className="p-4 flex items-center justify-between border-b border-slate-800">
                    {isSidebarOpen && <span className="font-bold text-xl tracking-wider">ADMIN</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
                        {isSidebarOpen ? "◀" : "▶"}
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                            A
                        </div>
                        {isSidebarOpen && (
                            <div>
                                <p className="text-sm font-bold">Admin User</p>
                                <p className="text-xs text-slate-500">System Admin</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
                {children}
            </div>
        </div>
    );
}
