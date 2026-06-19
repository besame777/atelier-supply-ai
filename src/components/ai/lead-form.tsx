"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Field, inputClass } from "./field";

export function LeadForm({
  dict,
  onSubmitted,
}: {
  dict: Dictionary["ai"]["lead"];
  onSubmitted?: () => void;
}) {
  const [method, setMethod] = useState("telegram");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // PLACEHOLDER — no lead backend lives in this module by design.
    // On the main Atelier Supply website, wire this up to the EXISTING lead
    // submission system (Telegram bot / email form / analytics goal) instead of
    // adding a new integration here. Collect { name, phone, email, messenger,
    // method } from the form plus the generated concept context (style, palette,
    // room type, area, image) and forward it to that handler, then call
    // onSubmitted(). Do NOT duplicate Telegram/email logic in this module.
    // See docs/AI_MODULE_INTEGRATION.md → "Lead submission".
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-display text-2xl font-medium tracking-tight">{dict.title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{dict.subtitle}</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label={dict.name}>
          <input name="name" type="text" required className={inputClass} />
        </Field>
        <Field label={dict.phone}>
          <input name="phone" type="tel" required className={inputClass} />
        </Field>
        <Field label={dict.email}>
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label={dict.messenger}>
          <input
            name="messenger"
            type="text"
            placeholder={dict.messengerPlaceholder}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-6">
        <span className="mb-2 block text-sm font-medium">{dict.method}</span>
        <div className="flex flex-wrap gap-2.5">
          {dict.methods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                method === m.value
                  ? "border-accent bg-beige/70 font-medium text-brown"
                  : "border-border text-muted hover:border-accent/50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 w-full rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-background transition-colors hover:bg-brown sm:w-auto"
      >
        {dict.submit}
      </button>
    </form>
  );
}
