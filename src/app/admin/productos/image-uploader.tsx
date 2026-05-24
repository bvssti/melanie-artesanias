"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "product-images";
const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploaderProps {
  /** URLs iniciales (al editar un producto existente). */
  initial?: string[];
  /** Nombre del input oculto que va al server action. URLs separadas por "\n". */
  name?: string;
  /** Disabled mientras se guarda el form. */
  disabled?: boolean;
}

interface Slot {
  url: string;
  // Path dentro del bucket; permite borrar de storage al hacer X.
  path?: string;
}

function inferExt(file: File): string {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  const dot = file.name.lastIndexOf(".");
  return dot >= 0 ? file.name.slice(dot + 1) : "bin";
}

function pathFromPublicUrl(url: string): string | undefined {
  // URL pública estándar de Supabase Storage:
  //   .../storage/v1/object/public/<bucket>/<path>
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return undefined;
  return url.slice(i + marker.length);
}

export function ImageUploader({
  initial = [],
  name = "images",
  disabled = false,
}: ImageUploaderProps) {
  const [slots, setSlots] = useState<Slot[]>(
    initial.map((url) => ({ url, path: pathFromPublicUrl(url) }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_IMAGES - slots.length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const incoming = Array.from(files).slice(0, remaining);
    if (incoming.length === 0) return;

    // Validación previa
    for (const file of incoming) {
      if (!ALLOWED.includes(file.type)) {
        setError(`Formato no permitido: ${file.name}. Solo JPG, PNG o WebP.`);
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} pesa más de 5 MB.`);
        return;
      }
    }

    setUploading(true);
    const supabase = createClient();
    const uploaded: Slot[] = [];

    try {
      for (const file of incoming) {
        const path = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${inferExt(file)}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (upErr) {
          setError(`No se pudo subir ${file.name}: ${upErr.message}`);
          break;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, path });
      }
      if (uploaded.length) {
        setSlots((s) => [...s, ...uploaded]);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeSlot(idx: number) {
    const slot = slots[idx];
    setSlots((s) => s.filter((_, i) => i !== idx));
    if (slot.path) {
      const supabase = createClient();
      // Best-effort: si falla queda huérfana, pero no bloqueamos al usuario.
      await supabase.storage.from(BUCKET).remove([slot.path]);
    }
  }

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={slots.map((s) => s.url).join("\n")}
      />

      {slots.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
          {slots.map((slot, idx) => (
            <li
              key={slot.url}
              className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted group"
            >
              <Image
                src={slot.url}
                alt={`Imagen ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeSlot(idx)}
                disabled={disabled || uploading}
                aria-label={`Eliminar imagen ${idx + 1}`}
                className="absolute top-1.5 right-1.5 w-7 h-7 grid place-items-center rounded-full bg-foreground/80 text-white hover:bg-destructive transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] uppercase font-bold tracking-wider bg-bg-card/90 text-foreground px-2 py-0.5 rounded-full">
                  Portada
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <label
        className={cn(
          "flex items-center justify-center gap-2 h-24 rounded-2xl border-2 border-dashed border-border bg-bg-card text-foreground-soft cursor-pointer transition-colors",
          "hover:border-accent hover:text-foreground hover:bg-muted/50",
          (disabled || uploading || remaining <= 0) &&
            "cursor-not-allowed opacity-60 hover:border-border hover:bg-bg-card"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          multiple
          className="sr-only"
          disabled={disabled || uploading || remaining <= 0}
          onChange={(e) => handleFiles(e.currentTarget.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Subiendo…</span>
          </>
        ) : remaining <= 0 ? (
          <span className="text-sm font-medium">
            Máximo {MAX_IMAGES} imágenes
          </span>
        ) : (
          <>
            <ImagePlus className="w-5 h-5" />
            <span className="text-sm font-medium">
              Añadir imagen ({remaining} restantes)
            </span>
          </>
        )}
      </label>

      <p className="text-xs text-secondary mt-2">
        JPG, PNG o WebP · máx 5 MB cada una · la primera se usa como portada.
      </p>
      {error && (
        <p
          role="alert"
          className="text-xs text-destructive mt-2 font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}
