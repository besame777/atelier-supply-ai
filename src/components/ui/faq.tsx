"use client";

import { useState } from "react";

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-8"
            >
              <span className="font-medium">{item.q}</span>
              <span
                aria-hidden
                className={`shrink-0 text-accent transition-transform ${open ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            {open && (
              <p className="px-6 pb-6 text-sm leading-relaxed text-muted sm:px-8">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
