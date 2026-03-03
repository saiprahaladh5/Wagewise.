"use client";

import React, { useState, useCallback } from "react";

type ChartTab = {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

type Props = {
  tabs: ChartTab[];
};

export default function ChartPagination({ tabs }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((idx: number) => {
    setActiveIndex(Math.max(0, Math.min(idx, tabs.length - 1)));
  }, [tabs.length]);

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const active = tabs[activeIndex];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => goTo(i)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 ${
              i === activeIndex
                ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20"
                : "border border-white/[0.04] bg-[#0b1120] text-slate-500 hover:border-white/[0.08] hover:text-slate-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.06)]"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Chart card */}
      <div className="rounded-2xl p-5" style={{
        background: "linear-gradient(145deg, #0c1220 0%, #111a2e 50%, #0c1220 100%)",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        backdropFilter: "blur(20px)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 4px 40px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1)",
      }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-white">{active.label}</span>
            <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
              {activeIndex + 1} / {tabs.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] bg-[#0b1120] text-slate-500 transition-all hover:border-cyan-500/20 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.1)] disabled:cursor-not-allowed disabled:opacity-20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={goNext}
              disabled={activeIndex === tabs.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.04] bg-[#0b1120] text-slate-500 transition-all hover:border-cyan-500/20 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.1)] disabled:cursor-not-allowed disabled:opacity-20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="min-h-[280px]">
          {active.content}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-7 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                : "w-2 bg-white/[0.06] hover:bg-white/[0.12]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
