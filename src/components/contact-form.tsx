"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Field, inputClass } from "@/components/ai/field";

export function ContactForm({ dict }: { dict: Dictionary["contactsPage"]["form"] }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-surface p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl text-background">
          ✓
        </span>
        <h3 className="font-display mt-6 text-2xl font-medium">{dict.successTitle}</h3>
        <p className="mt-3 max-w-sm text-sm text-muted">{dict.successText}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true); // MVP: no backend yet
      }}
      className="rounded-2xl border border-border bg-surface p-8 sm:p-10"
    >
      <h3 className="font-display text-2xl font-medium">{dict.title}</h3>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={dict.name}>
          <input name="name" type="text" required className={inputClass} />
        </Field>
        <Field label={dict.phone}>
          <input name="phone" type="tel" className={inputClass} />
        </Field>
        <Field label={dict.email} className="sm:col-span-2">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label={dict.message} className="sm:col-span-2">
          <textarea
            name="message"
            rows={4}
            required
            placeholder={dict.messagePlaceholder}
            className={inputClass}
          />
        </Field>
      </div>
      <button
        type="submit"
        className="mt-7 w-full rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-colors hover:bg-brown sm:w-auto"
      >
        {dict.submit}
      </button>
    </form>
  );
}
