"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LoginForm } from "@/app/login/page";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="flex-grow flex flex-col lg:flex-row items-center justify-center px-6 py-12 relative overflow-hidden max-w-7xl mx-auto w-full gap-12">

        {/* Left Side: Hero Text */}
        <div className="flex-1 text-center lg:text-left z-10">
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-tight">
            Master Your <br /> Academic Journey
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            The ultimate tool for OUSL BSE students. Track your GPA, identify credit deficiencies,
            and verify your graduation eligibility with precision and ease.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white shadow-sm">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-bold text-gray-800">GPA Calculator</h3>
              <p className="text-sm text-gray-500">Instant & accurate</p>
            </div>
            <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white shadow-sm">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-bold text-gray-800">Credit Check</h3>
              <p className="text-sm text-gray-500">Track progress</p>
            </div>
            <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white shadow-sm">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="font-bold text-gray-800">Eligibility</h3>
              <p className="text-sm text-gray-500">Graduation ready</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 w-full max-w-md z-10">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm isEmbedded={true} />
          </Suspense>
        </div>

        {/* Background Blobs */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
      </div>
    </main>
  );
}
