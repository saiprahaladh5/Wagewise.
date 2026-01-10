"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // You can also enforce email confirmation here if you enabled it
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 right-10 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute top-40 left-0 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="mx-4 flex w-full max-w-md flex-col gap-4 rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.9)] backdrop-blur-xl">
        {/* Brand / heading */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 via-sky-400 to-fuchsia-500 shadow-lg shadow-emerald-500/50">
            <span className="text-lg font-black text-slate-950">W</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-50">Join WageWise</p>
            <p className="text-xs text-slate-300">
              Create your AI-powered money journal
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/70 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-1 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/50"
              placeholder="Create a strong password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-500 px-3 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating your account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-1 text-center text-xs text-slate-400">
          Already using WageWise?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
