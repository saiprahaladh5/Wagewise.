"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 p-6 text-center border border-slate-800">
        <h2 className="text-2xl font-semibold mb-2 text-rose-400">
          Something went wrong!
        </h2>
        <p className="text-sm text-slate-300 mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
