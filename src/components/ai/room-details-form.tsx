"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { RoomConceptInput } from "@/lib/types";
import { PALETTES } from "@/lib/data/palettes";
import { Field, inputClass } from "./field";

export function RoomDetailsForm({
  dict,
  onSubmit,
  disabled = false,
  disabledHint,
}: {
  dict: Dictionary["ai"]["roomForm"];
  onSubmit: (input: RoomConceptInput) => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [style, setStyle] = useState("modern");
  const [palette, setPalette] = useState("warm-neutral");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      roomType: String(fd.get("roomType") ?? "living"),
      length: Number(fd.get("length") ?? 0) || 5,
      width: Number(fd.get("width") ?? 0) || 4,
      height: Number(fd.get("height") ?? 0) || 2.8,
      windows: Number(fd.get("windows") ?? 0),
      doors: Number(fd.get("doors") ?? 1),
      constraints: String(fd.get("constraints") ?? ""),
      style,
      palette,
      budget: String(fd.get("budget") ?? ""),
      city: String(fd.get("city") ?? ""),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-display text-2xl font-medium tracking-tight">{dict.title}</h3>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label={dict.roomType}>
          <select name="roomType" className={inputClass} defaultValue="living">
            {dict.roomTypes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={dict.city}>
          <input name="city" type="text" placeholder={dict.cityPlaceholder} required className={inputClass} />
        </Field>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Field label={dict.length}>
          <input name="length" type="number" step="0.1" min={1} max={50} defaultValue={5} required className={inputClass} />
        </Field>
        <Field label={dict.width}>
          <input name="width" type="number" step="0.1" min={1} max={50} defaultValue={4} required className={inputClass} />
        </Field>
        <Field label={dict.height}>
          <input name="height" type="number" step="0.05" min={2} max={8} defaultValue={2.8} required className={inputClass} />
        </Field>
        <Field label={dict.windows}>
          <input name="windows" type="number" min={0} max={10} defaultValue={1} className={inputClass} />
        </Field>
        <Field label={dict.doors}>
          <input name="doors" type="number" min={0} max={10} defaultValue={1} className={inputClass} />
        </Field>
        <Field label={dict.budget}>
          <select name="budget" className={inputClass} defaultValue="10-25">
            {dict.budgets.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Prominent style selector — drives the AI design concept */}
      <fieldset className="mt-8">
        <legend className="text-sm font-medium">{dict.style}</legend>
        <p className="mt-1 text-xs text-muted">{dict.styleHint}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dict.styles.map((s) => {
            const active = style === s.value;
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStyle(s.value)}
                className={`flex h-full flex-col rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  active
                    ? "border-accent bg-beige/60 ring-1 ring-accent/40"
                    : "border-border bg-background hover:border-accent/50"
                }`}
              >
                <span className="font-display text-sm font-medium tracking-tight">{s.label}</span>
                <span className="mt-1 text-xs leading-snug text-muted">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Prominent palette selector — drives the AI color direction */}
      <fieldset className="mt-8">
        <legend className="text-sm font-medium">{dict.palette}</legend>
        <p className="mt-1 text-xs text-muted">{dict.paletteHint}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dict.palettes.map((p) => {
            const active = palette === p.value;
            const swatches = PALETTES[p.value] ?? [];
            return (
              <button
                key={p.value}
                type="button"
                aria-pressed={active}
                onClick={() => setPalette(p.value)}
                className={`flex h-full flex-col rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  active
                    ? "border-accent bg-beige/60 ring-1 ring-accent/40"
                    : "border-border bg-background hover:border-accent/50"
                }`}
              >
                <span className="flex gap-1.5" aria-hidden>
                  {swatches.map((sw) => (
                    <span
                      key={sw.hex}
                      className="h-5 w-5 rounded-full border border-border/70"
                      style={{ backgroundColor: sw.hex }}
                    />
                  ))}
                </span>
                <span className="font-display mt-2.5 text-sm font-medium tracking-tight">{p.label}</span>
                <span className="mt-1 text-xs leading-snug text-muted">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label={dict.constraints} className="mt-6">
        <textarea
          name="constraints"
          rows={3}
          placeholder={dict.constraintsPlaceholder}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={disabled}
        className="mt-8 w-full rounded-full btn-gold px-7 py-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {dict.submit}
      </button>
      {disabled && disabledHint && (
        <p className="mt-3 max-w-md text-xs leading-relaxed text-muted">{disabledHint}</p>
      )}
    </form>
  );
}
