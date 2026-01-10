"use client";

export default function Reports() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">System Reports</h1>
            <p className="text-slate-500 mb-8">Analytics and insights for the BSE programme.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Student Performance (GPA)</h3>
                    <div className="h-64 flex items-end justify-between px-4 pb-4 border-b border-slate-100 space-x-2">
                        {/* Mock Chart Bars */}
                        <div className="w-full bg-blue-100 rounded-t-lg relative group h-[20%]">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">0-2.0</div>
                        </div>
                        <div className="w-full bg-blue-300 rounded-t-lg relative group h-[40%]">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">2.0-3.0</div>
                        </div>
                        <div className="w-full bg-blue-500 rounded-t-lg relative group h-[60%]">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">3.0-3.7</div>
                        </div>
                        <div className="w-full bg-blue-700 rounded-t-lg relative group h-[15%]">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">3.7+</div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
                        <span>0-2.0</span>
                        <span>2.0-3.0</span>
                        <span>3.0-3.7</span>
                        <span>3.7+</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Credit Deficiencies</h3>
                    <div className="flex items-center justify-center h-64">
                        <div className="w-48 h-48 rounded-full border-8 border-slate-100 relative">
                            <div className="absolute inset-0 border-8 border-red-500 rounded-full border-t-transparent border-l-transparent rotate-45"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-slate-800">12%</span>
                                <span className="text-xs text-slate-500">At Risk</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Export Data</h3>
                <div className="flex gap-4">
                    <button className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-2 text-slate-700 font-medium">
                        <span>📄</span> Download Student List (CSV)
                    </button>
                    <button className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-2 text-slate-700 font-medium">
                        <span>📊</span> Download GPA Report (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
}
