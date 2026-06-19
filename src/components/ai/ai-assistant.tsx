"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type {
  AIReport,
  DesignGenerationResult,
  ProjectEstimateInput,
  RoomConceptInput,
} from "@/lib/types";
import { generateConceptReport, generateEstimateReport } from "@/lib/ai/reports";
import { buildPreliminaryEstimate } from "@/lib/ai/preliminary-estimate";
import {
  MAX_GENERATIONS_PER_SESSION,
  MAX_REGENERATIONS_PER_RESULT,
  SESSION_USAGE_KEY,
} from "@/lib/ai/usage-limits";
import { siteImages } from "@/lib/images";
import { ScenarioCard } from "@/components/cards/scenario-card";
import { WizardShell } from "./wizard-shell";
import { UploadBox } from "./upload-box";
import { ProjectDetailsForm } from "./project-details-form";
import { RoomDetailsForm } from "./room-details-form";
import { AIReportPreview } from "./ai-report-preview";
import { LeadForm } from "./lead-form";

type Scenario = "project" | "room";

/** Simulated analysis duration per status line, ms. */
const LINE_DELAY = 900;

const GENERATE_URL = "/api/ai/design/generate";
const REGENERATE_URL = "/api/ai/design/regenerate";

export function AIAssistant({
  locale,
  dict,
  preliminaryBadge,
  preliminaryNote,
}: {
  locale: Locale;
  dict: Dictionary["ai"];
  preliminaryBadge: string;
  preliminaryNote: string;
}) {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [step, setStep] = useState(0);
  const [pendingInput, setPendingInput] = useState<
    | { kind: "project"; input: ProjectEstimateInput }
    | { kind: "room"; input: RoomConceptInput }
    | null
  >(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [generation, setGeneration] = useState<DesignGenerationResult | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [genError, setGenError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [analyzingLine, setAnalyzingLine] = useState(0);
  const [leadDone, setLeadDone] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const steps = scenario === "room" ? dict.wizard.roomSteps : dict.wizard.projectSteps;

  // Read the per-session generation count from sessionStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionCount(Number(window.sessionStorage.getItem(SESSION_USAGE_KEY)) || 0);
  }, []);

  /** Count one paid AI visualization (generation or regeneration) for this session. */
  const bumpSessionCount = () => {
    setSessionCount((prev) => {
      const next = prev + 1;
      try {
        window.sessionStorage.setItem(SESSION_USAGE_KEY, String(next));
      } catch {
        /* sessionStorage unavailable — fall back to in-memory count only */
      }
      return next;
    });
  };

  const sessionLimitReached = sessionCount >= MAX_GENERATIONS_PER_SESSION;
  const regenLimitReached = (generation?.variant ?? 0) >= MAX_REGENERATIONS_PER_RESULT;
  const regenerateDisabled = sessionLimitReached || regenLimitReached;
  const regenerateHint = sessionLimitReached
    ? dict.limits.sessionReached
    : regenLimitReached
      ? dict.limits.regenReached
      : undefined;

  // Item-based preliminary estimate from the detected items (room flow only).
  // Empty groups → null, so the report falls back to its generic budget range.
  const roomInput = pendingInput?.kind === "room" ? pendingInput.input : null;
  const estimate =
    generation?.analysis && roomInput
      ? (() => {
          const e = buildPreliminaryEstimate({
            roomType: roomInput.roomType,
            style: roomInput.style,
            palette: roomInput.palette,
            budget: roomInput.budget,
            analysis: generation.analysis,
          });
          return e.groups.length > 0 ? e : null;
        })()
      : null;

  /** Localized display names for a room input, sourced from the dictionary. */
  const buildLabels = (input: RoomConceptInput) => {
    const pick = (arr: { value: string; label: string }[], v: string) =>
      arr.find((o) => o.value === v)?.label ?? v;
    return {
      style: pick(dict.roomForm.styles, input.style),
      palette: pick(dict.roomForm.palettes, input.palette),
      roomType: pick(dict.roomForm.roomTypes, input.roomType),
    };
  };

  /** POST room inputs to the design API; returns the generation result. */
  const postGeneration = async (
    url: string,
    input: RoomConceptInput,
    variant: number
  ): Promise<DesignGenerationResult> => {
    const labels = buildLabels(input);
    const fields: Record<string, string> = {
      roomType: input.roomType,
      style: input.style,
      palette: input.palette,
      budget: input.budget,
      constraints: input.constraints,
      locale,
      length: String(input.length),
      width: String(input.width),
      height: String(input.height),
      windows: String(input.windows),
      doors: String(input.doors),
      labelStyle: labels.style,
      labelPalette: labels.palette,
      labelRoomType: labels.roomType,
      variant: String(variant),
    };

    let res: Response;
    if (photoFile) {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", photoFile);
      res = await fetch(url, { method: "POST", body: fd });
    } else {
      res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
    }
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as DesignGenerationResult;
  };

  // Step 2: advance the status lines, then produce the report + concept.
  useEffect(() => {
    if (step !== 2 || report !== null || genError || pendingInput === null) return;
    // Room generation is a paid call — block it once the session limit is hit
    // (step 2 then shows the limit notice instead of the loading state).
    if (pendingInput.kind === "room" && sessionLimitReached) return;

    if (analyzingLine < dict.analyzing.lines.length) {
      const t = setTimeout(() => setAnalyzingLine((n) => n + 1), LINE_DELAY);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    (async () => {
      if (pendingInput.kind === "project") {
        if (!cancelled) setReport(generateEstimateReport(pendingInput.input, locale));
        return;
      }
      const input = pendingInput.input;
      try {
        const res = await postGeneration(GENERATE_URL, input, 0);
        if (cancelled) return;
        setGeneration({ ...res, originalImage: photoFile ? photoUrl ?? undefined : undefined });
        setReport(generateConceptReport(input, locale));
        bumpSessionCount();
      } catch (err) {
        if (cancelled) return;
        console.error("Design generation failed:", err);
        setGenError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // buildLabels/postGeneration are pure helpers over state — intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, report, genError, retryToken, pendingInput, analyzingLine, dict.analyzing.lines.length, locale, photoFile, photoUrl]);

  const retryGeneration = () => {
    setGenError(false);
    setRetryToken((t) => t + 1);
  };

  const handleRegenerate = async () => {
    if (regenerating || !generation || pendingInput?.kind !== "room") return;
    if (regenerateDisabled) return; // session or per-result limit reached
    setRegenerating(true);
    const input = pendingInput.input;
    const nextVariant = generation.variant + 1;
    try {
      const res = await postGeneration(REGENERATE_URL, input, nextVariant);
      setGeneration({ ...res, originalImage: generation.originalImage });
      setReport(generateConceptReport(input, locale));
      bumpSessionCount();
    } catch (err) {
      // Keep the current concept on a failed regeneration; just stop the spinner.
      console.error("Design regeneration failed:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const clearPhoto = () => {
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPhotoFile(null);
  };

  const restart = () => {
    clearPhoto();
    setScenario(null);
    setStep(0);
    setPendingInput(null);
    setReport(null);
    setGeneration(null);
    setRegenerating(false);
    setGenError(false);
    setAnalyzingLine(0);
    setLeadDone(false);
  };

  const goBack = () => {
    if (step === 0) {
      restart();
      return;
    }
    if (step === 2) {
      // Leaving the report step discards the generated report and concept.
      setReport(null);
      setGeneration(null);
      setGenError(false);
      setAnalyzingLine(0);
    }
    setStep((s) => s - 1);
  };

  /* ------------------------- Scenario selection ------------------------- */
  if (!scenario) {
    return (
      <div>
        <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {dict.scenarios.title}
        </h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <ScenarioCard
            title={dict.scenarios.project.title}
            text={dict.scenarios.project.text}
            bullets={dict.scenarios.project.bullets}
            ctaLabel={dict.scenarios.project.cta}
            image={{ src: siteImages.aiProject.src, alt: siteImages.aiProject.alt[locale] }}
            onSelect={() => setScenario("project")}
          />
          <ScenarioCard
            title={dict.scenarios.room.title}
            text={dict.scenarios.room.text}
            bullets={dict.scenarios.room.bullets}
            ctaLabel={dict.scenarios.room.cta}
            image={{ src: siteImages.aiRoom.src, alt: siteImages.aiRoom.alt[locale] }}
            onSelect={() => setScenario("room")}
          />
        </div>
      </div>
    );
  }

  /* ------------------------------ Wizard ------------------------------- */
  return (
    <WizardShell
      steps={steps}
      current={step}
      onBack={leadDone ? undefined : goBack}
      backLabel={dict.wizard.back}
    >
      {/* Step 1: upload */}
      {step === 0 && (
        <div>
          <UploadBox
            title={scenario === "project" ? dict.upload.projectTitle : dict.upload.roomTitle}
            hint={scenario === "project" ? dict.upload.projectHint : dict.upload.roomHint}
            formats={scenario === "project" ? dict.upload.projectFormats : dict.upload.roomFormats}
            buttonLabel={dict.upload.button}
            selectedLabel={dict.upload.selected}
            note={dict.upload.note}
            accept={scenario === "project" ? ".pdf,.jpg,.jpeg,.png,.zip" : ".jpg,.jpeg,.png,.webp"}
            onFiles={
              scenario === "room"
                ? (files) => {
                    const img = files.find((f) => f.type.startsWith("image/")) ?? files[0] ?? null;
                    setPhotoFile(img ?? null);
                    setPhotoUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return img ? URL.createObjectURL(img) : null;
                    });
                  }
                : undefined
            }
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-colors hover:bg-brown"
            >
              {scenario === "room" && photoFile ? dict.upload.continueRedesign : dict.upload.continue}
            </button>
            {scenario === "room" && (
              <button
                type="button"
                onClick={() => {
                  clearPhoto();
                  setStep(1);
                }}
                className="rounded-full border border-foreground/25 px-7 py-3.5 text-sm font-medium transition-colors hover:border-accent"
              >
                {dict.upload.continueManually}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: details form */}
      {step === 1 &&
        (scenario === "project" ? (
          <ProjectDetailsForm
            dict={dict.projectForm}
            onSubmit={(input) => {
              setPendingInput({ kind: "project", input });
              setStep(2);
            }}
          />
        ) : (
          <RoomDetailsForm
            dict={dict.roomForm}
            disabled={sessionLimitReached}
            disabledHint={dict.limits.sessionReached}
            onSubmit={(input) => {
              setPendingInput({ kind: "room", input });
              setStep(2);
            }}
          />
        ))}

      {/* Step 2: session limit reached (paid generation blocked) */}
      {step === 2 && !report && scenario === "room" && sessionLimitReached && (
        <div className="py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 text-2xl text-bronze">
            ✕
          </span>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted">
            {dict.limits.sessionReached}
          </p>
        </div>
      )}

      {/* Step 3a: analyzing / generating */}
      {step === 2 && !report && !genError && !(scenario === "room" && sessionLimitReached) && (
        <div className="py-10 text-center">
          <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-2 border-border border-t-accent" />
          <h3 className="font-display mt-8 text-2xl font-medium tracking-tight">
            {scenario === "project" ? dict.analyzing.titleProject : dict.generation.generatingTitle}
          </h3>
          <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
            {dict.analyzing.lines.map((line, i) => (
              <li
                key={line}
                className={`flex items-center gap-3 text-sm transition-opacity ${
                  i <= analyzingLine ? "text-foreground/80" : "text-muted/40"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    i < analyzingLine ? "bg-accent text-background" : "border border-border text-muted"
                  }`}
                >
                  {i < analyzingLine ? "✓" : ""}
                </span>
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-muted">{dict.analyzing.note}</p>
        </div>
      )}

      {/* Step 3b: generation error */}
      {step === 2 && genError && (
        <div className="py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 text-2xl text-bronze">
            !
          </span>
          <h3 className="font-display mt-6 text-2xl font-medium tracking-tight">
            {dict.generation.errorTitle}
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            {dict.generation.errorText}
          </p>
          <button
            type="button"
            onClick={retryGeneration}
            className="mt-8 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-colors hover:bg-brown"
          >
            {dict.generation.retry}
          </button>
        </div>
      )}

      {step === 2 && report && (
        <AIReportPreview
          report={report}
          dict={dict.report}
          designPreviewDict={dict.designPreview}
          generation={scenario === "room" ? generation : null}
          roomConceptDict={dict.roomConcept}
          statusDict={dict.generation}
          analysisDict={dict.analysis}
          estimate={scenario === "room" ? estimate : null}
          estimateDict={dict.estimate}
          locale={locale}
          regenerating={regenerating}
          regenerateDisabled={regenerateDisabled}
          regenerateHint={regenerateHint}
          onRegenerate={handleRegenerate}
          preliminaryBadge={preliminaryBadge}
          preliminaryNote={preliminaryNote}
          onContinue={() => setStep(3)}
        />
      )}

      {/* Step 4: lead form / success */}
      {step === 3 && !leadDone && (
        <LeadForm dict={dict.lead} onSubmitted={() => setLeadDone(true)} />
      )}

      {step === 3 && leadDone && (
        <div className="py-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl text-background">
            ✓
          </span>
          <h3 className="font-display mt-6 text-2xl font-medium tracking-tight">
            {dict.lead.successTitle}
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            {dict.lead.successText}
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-8 rounded-full border border-foreground/25 px-7 py-3 text-sm font-medium transition-colors hover:border-accent"
          >
            {dict.wizard.restart}
          </button>
        </div>
      )}
    </WizardShell>
  );
}
