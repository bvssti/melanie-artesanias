"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import { uploadProductPdf, deleteProductPdf } from "../actions";
import { cn } from "@/lib/utils";

interface PdfUploaderProps {
  /** Path actual del PDF dentro del bucket (no URL pública). */
  initialPath?: string;
  /** Nombre visible del archivo (no se persiste, solo UI). */
  initialFilename?: string;
  /** Nombre del campo oculto que se envía con el form principal. */
  name?: string;
  /** Deshabilitado mientras el form padre está guardando. */
  disabled?: boolean;
}

const MAX_BYTES = 20 * 1024 * 1024;

export function PdfUploader({
  initialPath = "",
  initialFilename = "",
  name = "pdf_url",
  disabled = false,
}: PdfUploaderProps) {
  const [path, setPath] = useState(initialPath);
  const [filename, setFilename] = useState(
    initialFilename || (initialPath ? "PDF guardado previamente" : "")
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function pick() {
    inputRef.current?.click();
  }

  function handleFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("El PDF no puede pesar más de 20 MB");
      return;
    }

    startTransition(async () => {
      // Si había un PDF previo, lo borramos del bucket tras subir el nuevo
      // para no acumular huérfanos.
      const previousPath = path;
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadProductPdf(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPath(result.path);
      setFilename(result.filename);
      if (previousPath && previousPath !== result.path) {
        await deleteProductPdf(previousPath);
      }
    });
  }

  function clear() {
    const previousPath = path;
    setPath("");
    setFilename("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    if (previousPath) {
      startTransition(async () => {
        await deleteProductPdf(previousPath);
      });
    }
  }

  const busy = pending || disabled;

  return (
    <div>
      <input type="hidden" name={name} value={path} />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {path ? (
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-bg-card">
          <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent grid place-items-center shrink-0">
            {pending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{filename}</div>
            <div className="text-xs text-secondary truncate">
              Guardado en bucket privado · /{path}
            </div>
          </div>
          <button
            type="button"
            onClick={pick}
            disabled={busy}
            className="text-xs font-semibold text-accent hover:underline px-2 py-1 disabled:opacity-50"
          >
            Reemplazar
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={busy}
            aria-label="Quitar PDF"
            className="w-7 h-7 grid place-items-center rounded-full text-foreground-soft hover:bg-muted hover:text-destructive transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className={cn(
            "flex items-center justify-center gap-2 w-full h-24 rounded-2xl border-2 border-dashed border-border bg-bg-card text-foreground-soft transition-colors",
            "hover:border-accent hover:text-foreground hover:bg-muted/50",
            busy &&
              "cursor-not-allowed opacity-60 hover:border-border hover:bg-bg-card"
          )}
        >
          {pending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Subiendo PDF…</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">
                Subir PDF del patrón
              </span>
            </>
          )}
        </button>
      )}

      <p className="text-xs text-secondary mt-2">
        Solo PDF · máx 20 MB · se sube al bucket privado{" "}
        <code>product-pdfs</code>. El cliente lo descarga vía URL firmada
        después de pagar.
      </p>
      {error && (
        <p role="alert" className="text-xs text-destructive mt-2 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
