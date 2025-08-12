"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setError("");
      setMessage("");
      setLoading(true);
      if (!email) {
        setError("Please enter your email");
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent to your email.");
    } catch (err: any) {
      setError(err.message);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 p-2 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        {/* Logo or Brand */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg mb-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="#22c55e" />
              <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Minty List</h1>
          <span className="text-green-500 font-medium text-sm mt-1">Forgot your password?</span>
        </div>
        {message && <div className="w-full max-w-xs bg-green-100 text-green-700 px-3 py-2 rounded mb-3 text-center text-sm">{message}</div>}
        {error && <div className="w-full max-w-xs bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-center text-sm">{error}</div>}
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={e => { e.preventDefault(); handleReset(); }}
          autoComplete="on"
        >
          <label className="w-full">
            <span className="block text-gray-700 text-sm font-medium mb-1">Email</span>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition mb-1 bg-white text-black"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-bold text-lg shadow-md hover:from-green-500 hover:to-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="w-full flex flex-col items-center mt-5 gap-2">
          <a href="/login" className="text-green-600 hover:underline text-sm">Back to Login</a>
        </div>
      </div>
    </div>
  );
}
