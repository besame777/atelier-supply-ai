"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { ProjectEstimateInput, QualityTier } from "@/lib/types";
import { Field, inputClass } from "./field";

export function ProjectDetailsForm({
  dict,
  onSubmit,
}: {
  dict: Dictionary["ai"]["projectForm"];
  onSubmit: (input: ProjectEstimateInput) => void;
}) {
  const [quality, setQuality] = useState<QualityTier>("balanced");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      objectType: String(fd.get("objectType") ?? "apartment"),
      area: Number(fd.get("area") ?? 0) || 80,
      city: String(fd.get("city") ?? ""),
      budget: String(fd.get("budget") ?? ""),
      quality,
      deadline: String(fd.get("deadline") ?? ""),
      comment: String(fd.get("comment") ?? ""),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-display text-2xl font-medium tracking-tight">{dict.title}</h3>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label={dict.objectType}>
          <select name="objectType" className={inputClass} defaultValue="apartment">
            {dict.objectTypes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={dict.area}>
          <input
            name="area"
            type="number"
            min={5}
            max={10000}
            defaultValue={100}
            required
            className={inputClass}
          />
        </Field>

        <Field label={dict.city}>
          <input
            name="city"
            type="text"
            placeholder={dict.cityPlaceholder}
            required
            className={inputClass}
          />
        </Field>

        <Field label={dict.budget}>
          <select name="budget" className={inputClass} defaultValue="25-60">
            {dict.budgets.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Quality tier selector */}
      <div className="mt-6">
        <span className="mb-2 block text-sm font-medium">{dict.quality}</span>
        <div className="grid gap-3 sm:grid-cols-3">
          {dict.qualities.map((q) => (
            <button
              key={q.value}
              type="button"
              onClick={() => setQuality(q.value as QualityTier)}
              className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                quality === q.value
                  ? "border-accent bg-beige/60"
                  : "border-border bg-background hover:border-accent/50"
              }`}
            >
              <span className="block text-sm font-medium">{q.label}</span>
              <span className="mt-0.5 block text-xs text-muted">{q.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={dict.deadline}>
          <select name="deadline" className={inputClass} defaultValue="2-3m">
            {dict.deadlines.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={dict.comment} className="mt-5">
        <textarea
          name="comment"
          rows={3}
          placeholder={dict.commentPlaceholder}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        className="mt-8 w-full rounded-full btn-gold px-7 py-3.5 text-sm font-medium transition-colors sm:w-auto"
      >
        {dict.submit}
      </button>
    </form>
  );
}
