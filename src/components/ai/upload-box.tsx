"use client";

import { useRef, useState } from "react";

/**
 * File upload UI placeholder — files are kept in memory only,
 * nothing is sent to a server in the MVP.
 */
export function UploadBox({
  title,
  hint,
  formats,
  buttonLabel,
  selectedLabel,
  note,
  accept,
  onChange,
  onFiles,
}: {
  title: string;
  hint: string;
  formats: string;
  buttonLabel: string;
  selectedLabel: string;
  note: string;
  accept: string;
  onChange?: (names: string[]) => void;
  onFiles?: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<string[]>([]);

  const handleFiles = (list: FileList | null) => {
    const arr = list ? Array.from(list) : [];
    setFiles(arr.map((f) => f.name));
    onChange?.(arr.map((f) => f.name));
    onFiles?.(arr);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-border bg-background px-6 py-12 text-center transition-colors hover:border-accent"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-beige text-xl text-bronze">
          ↑
        </span>
        <span className="mt-4 font-medium">{title}</span>
        <span className="mt-1.5 text-sm text-muted">{hint}</span>
        <span className="mt-3 text-xs tracking-wide text-muted/80 uppercase">{formats}</span>
        <span className="mt-6 rounded-full border border-foreground/25 px-5 py-2 text-sm font-medium">
          {buttonLabel}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {selectedLabel} {files.length}
          </p>
          <ul className="mt-2 space-y-1">
            {files.map((name) => (
              <li key={name} className="truncate text-sm">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-muted/80">{note}</p>
    </div>
  );
}
