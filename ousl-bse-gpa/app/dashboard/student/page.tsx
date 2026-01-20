"use client";
import Protected from "@/components/Protected";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function StudentDashboard() {
    return (
        <Protected>
            <main className="min-h-screen bg-gray-50 pb-20">
                <Navbar />

                {/* Header Section */}
                <div className="bg-blue-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                    <div className="container mx-auto relative z-10">
                        <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
                        <p className="text-blue-200 text-lg">Empowering your academic journey with real-time progress and insights.</p>
                    </div>
                </div>

                <div className="container mx-auto px-6 -mt-16 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DashboardCard
                            title="GPA Calculator"
                            description="Calculate your current GPA and predict future grades."
                            link="/gpa"
                            icon="📊"
                            color="bg-gradient-to-br from-blue-500 to-blue-600"
                        />
                        <DashboardCard
                            title="Credit Deficiency"
                            description="Check if you have enough credits to graduate."
                            link="/credit-deficiency"
                            icon="📉"
                            color="bg-gradient-to-br from-purple-500 to-purple-600"
                        />
                        <DashboardCard
                            title="Eligibility Check"
                            description="Verify if you are eligible for the next level or graduation."
                            link="/eligibility"
                            icon="🎓"
                            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        />
                        <DashboardCard
                            title="Corrections"
                            description="Request corrections for your results."
                            link="/corrections"
                            icon="📝"
                            color="bg-gradient-to-br from-orange-500 to-orange-600"
                        />
                    </div>

                    {/* Quick Stats or Info Section could go here */}
                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <p className="text-gray-600 text-sm">Logged in successfully</p>
                                </div>
                                {/* More items would be dynamic */}
                                <p className="text-gray-400 text-sm italic">No recent activities to show.</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                            <h3 className="text-xl font-bold mb-4">Academic Tips</h3>
                            <ul className="space-y-3 text-slate-300 text-sm">
                                <li>• Maintain a GPA above 2.0 for good standing.</li>
                                <li>• Complete prerequisites before enrolling in advanced courses.</li>
                                <li>• Check your credit balance regularly.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </Protected>
    );
}

function DashboardCard({ title, description, link, icon, color }: { title: string, description: string, link: string, icon: string, color: string }) {
    return (
        <Link href={link} className="block group">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                <div className={`h-2 ${color}`}></div>
                <div className="p-6 flex-grow">
                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300 text-white`}>
                        {icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">Access Tool</span>
                    <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </Link>
    );
}
