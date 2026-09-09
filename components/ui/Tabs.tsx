"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabDef {
  key: string;
  label: string;
  content: ReactNode;
  badge?: ReactNode;
}

export function Tabs({ tabs, defaultTab }: { tabs: TabDef[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-ink-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab.key === activeTab?.key
                ? "bg-accent-500 text-black"
                : "text-white/60 hover:bg-white/8 hover:text-white"
            )}
          >
            {tab.label}
            {tab.badge}
          </button>
        ))}
      </div>
      {activeTab?.content}
    </div>
  );
}
