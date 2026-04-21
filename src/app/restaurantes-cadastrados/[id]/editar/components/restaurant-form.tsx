"use client";

import { forwardRef, useActionState, useEffect, useRef } from "react";
import { Restaurant } from "@prisma/client";

import { updateRestaurant } from "../actions";

interface RestaurantFormProps {
  restaurant: Restaurant;
}

export default function RestaurantForm({ restaurant }: RestaurantFormProps) {
  const updateRestaurantWithId = updateRestaurant.bind(null, restaurant.id);
  const [state, formAction, pending] = useActionState(
    updateRestaurantWithId,
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
            🍴
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Editar Restaurante
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Atualize as informações do seu restaurante.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <form action={formAction} className="space-y-5">
            <Field
              id="name"
              label="Nome do Restaurante"
              placeholder="Ex: Restaurante Bom Prato"
              required
              defaultValue={restaurant.name}
              ref={nameRef}
              onChange={handleNameChange}
              error={state?.fieldErrors?.name}
            />

            <Field
              id="slug"
              label="URL Personalizada"
              placeholder="gerado-automaticamente"
              hint="Usado na URL: /restaurante/<slug>"
              defaultValue={restaurant.slug}
              onFocus={(e) => {
                (e.target as HTMLInputElement).dataset.touched = "true";
              }}
              error={state?.fieldErrors?.slug}
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
                defaultValue={restaurant.description}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
              />
              {state?.fieldErrors?.description && (
                <p className="text-xs text-red-500">{state.fieldErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                id="avatarImageUrl"
                label="URL da Logo"
                placeholder="https://..."
                hint="Opcional"
                defaultValue={restaurant.avatarImageUrl}
                error={state?.fieldErrors?.avatarImageUrl}
              />
              <Field
                id="coverImageUrl"
                label="URL da Capa"
                placeholder="https://..."
                hint="Opcional"
                defaultValue={restaurant.coverImageUrl}
                error={state?.fieldErrors?.coverImageUrl}
              />
            </div>

            <div className="border-t border-white/10 pt-2" />

            {state?.error && (
              <p className="text-center text-sm font-medium text-red-500">{state.error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="relative flex-[2] overflow-hidden rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-400 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Salvando...
                  </span>
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
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
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  error?: string;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, placeholder, hint, required, defaultValue, onChange, onFocus, error },
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
        defaultValue={defaultValue}
        onChange={onChange}
        onFocus={onFocus}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
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
