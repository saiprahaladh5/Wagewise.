import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 p-6 text-center border border-slate-800">
        <h2 className="text-2xl font-semibold mb-2 text-sky-400">
          404 - Page Not Found
        </h2>
        <p className="text-sm text-slate-300 mb-4">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
