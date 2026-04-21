"use client";

import { forwardRef, useActionState, useEffect, useRef } from "react";

import { createRestaurant } from "./actions";

export default function CreateRestaurantPage() {
  const [state, formAction, pending] = useActionState(
    createRestaurant,
    undefined
  );
  const nameRef = useRef<HTMLInputElement>(null);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById("slug") as HTMLInputElement;
    if (!slugInput || slugInput.dataset.touched === "true") return;
    slugInput.value = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 font-sans">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-700/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl shadow-lg shadow-orange-500/30">
            🍽️
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Cadastrar Restaurante
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Preencha as informações abaixo para adicionar um novo restaurante.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <form action={formAction} className="space-y-5">
            <Field
              id="name"
              label="Nome do Restaurante"
              placeholder="Ex: Restaurante Bom Prato"
              required
              ref={nameRef}
              onChange={handleNameChange}
            />

            <Field
              id="slug"
              label="URL Personalizada"
              placeholder="gerado-automaticamente"
              hint="Usado na URL: /restaurante/<slug>"
              onFocus={(e) => {
                (e.target as HTMLInputElement).dataset.touched = "true";
              }}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-300"
              >
                Descrição <span className="text-orange-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Ex: O melhor prato feito da universidade!"
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                id="avatarImageUrl"
                label="URL da Logo"
                placeholder="https://..."
                hint="Opcional"
              />
              <Field
                id="coverImageUrl"
                label="URL da Capa"
                placeholder="https://..."
                hint="Opcional"
              />
            </div>

            <div className="border-t border-white/10 pt-2" />

            <button
              type="submit"
              disabled={pending}
              className="relative w-full overflow-hidden rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-400 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Cadastrando...
                </span>
              ) : (
                "Cadastrar Restaurante"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Campos marcados com <span className="text-orange-400">*</span> são
          obrigatórios.
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in .45s ease both; }
      `}</style>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, placeholder, hint, required, onChange, onFocus },
  ref
) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-300">
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        name={id}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        onFocus={onFocus}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
});

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        d="M12 3a9 9 0 1 0 9 9"
        className="opacity-30"
      />
      <path strokeLinecap="round" d="M12 3a9 9 0 0 1 9 9" />
    </svg>
  );
}