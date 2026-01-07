"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reason = params?.get("reason") || null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // More helpful error messages
        if (error.message.includes("Invalid login credentials")) {
          setError("Email or password is incorrect. If you just signed up, check your email to confirm your account first.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link before logging in.");
        } else {
          setError(error.message);
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("Could not reach Supabase. Check URL / key in .env.local.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md rounded-xl bg-slate-900/80 p-6 shadow-xl border border-slate-800">
        <h1 className="text-2xl font-semibold mb-2">Log in to WageWise</h1>

        {reason === "expired" && (
          <p className="mb-3 text-xs text-amber-400">
            Your session expired. Please log in again.
          </p>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-sm text-slate-300">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
