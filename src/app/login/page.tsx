"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      if (!email || !password) {
        setError("Please enter email and password");
        setLoading(false);
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/notes");
    } catch (err: any) {
      let msg = "An error occurred. Please try again.";
      if (err && err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            msg = "No user found with this email.";
            break;
          case "auth/wrong-password":
            msg = "Incorrect password. Please try again.";
            break;
          case "auth/invalid-email":
            msg = "Invalid email address.";
            break;
          case "auth/too-many-requests":
            msg = "Too many failed attempts. Please try again later.";
            break;
          case "auth/invalid-credential":
            msg = "Invalid login credentials. Please check your email and password.";
            break;
          default:
            msg = err.message || msg;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 p-2 relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30">
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
          <span className="text-green-500 font-medium text-sm mt-1">Sign in to your account</span>
        </div>
        {error && <div className="w-full max-w-xs bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-center text-sm">{error}</div>}
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={e => { e.preventDefault(); handleLogin(); }}
          autoComplete="on"
        >
          <label className="w-full">
            <span className="block text-gray-700 text-sm font-medium mb-1">Email</span>
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition mb-1 bg-white text-gray-900 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="w-full">
            <span className="block text-gray-700 text-sm font-medium mb-1">Password</span>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition mb-1 bg-white text-gray-900 dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 text-white font-bold text-lg shadow-md hover:from-green-500 hover:to-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="w-full flex flex-col items-center mt-5 gap-2">
          <a href="/forgot-password" className="text-green-600 hover:underline text-sm">Forgot Password?</a>
          <span className="text-gray-500 text-sm">Don't have an account?{' '}
            <a href="/signup" className="text-green-600 hover:underline font-medium">Sign Up</a>
          </span>
        </div>
      </div>
    </div>
  );
}
