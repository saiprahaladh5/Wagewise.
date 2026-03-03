"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { motion } from "framer-motion";

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
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/");
  }

  async function handleGoogleSignUp() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d19]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-500/[0.09] blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 h-[700px] w-[700px] rounded-full bg-cyan-500/[0.08] blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.05] blur-[120px]" />
      </div>

      <motion.div
        className="mx-4 w-full max-w-[420px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="rounded-2xl px-8 py-10" style={{
          background: "linear-gradient(145deg, #0c1220 0%, #111a2e 50%, #0c1220 100%)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          backdropFilter: "blur(20px)",
          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 4px 40px rgba(0,0,0,0.5), 0 0 30px rgba(6,182,212,0.06)",
        }}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/30 ring-1 ring-white/10">
              <span className="text-xl font-black text-white">W</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
            <p className="mt-1.5 text-sm text-slate-400">Start tracking your money smarter with AI</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-xs text-rose-400">{error}</div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <span className="text-xs font-medium text-slate-600">or</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-[#0b1120] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.08)]" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-[#0b1120] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.08)]" placeholder="Create a strong password" />
            </div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-slate-600">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <div className="mt-4 rounded-2xl px-6 py-4 text-center" style={{
          background: "linear-gradient(145deg, #0c1220 0%, #111a2e 50%, #0c1220 100%)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
        }}>
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
