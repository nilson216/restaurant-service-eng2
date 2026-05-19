"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect,useRef } from "react";
import { toast } from "sonner";

import { createRestaurant } from "./actions";

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00437A]";

export default function CreateRestaurantPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRestaurant, undefined);
  const slugRef = useRef<HTMLInputElement>(null);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (isLoaded && !userId) {
      toast.error("Você precisa estar autenticado para criar um restaurante");
      router.push("/login");
    }
  }, [isLoaded, userId, router]);

  // Mostrar erro se houver
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.error]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugRef.current || slugRef.current.dataset.touched === "true") return;
    const name = e.target.value;
    slugRef.current.value = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 50);
  };

  // Se carregando ou não autenticado, mostrar loading
  if (!isLoaded || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00437A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        {/* HEADER */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Logo" width={100} height={100} className="mx-auto mb-4 rounded-full" />
          <h1 className="text-2xl font-bold text-[#00437A]">Univali Services</h1>
          <p className="text-gray-600 mt-2">Cadastre um novo restaurante</p>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Informações Básicas</h2>

          <form action={formAction} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Restaurante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Ex: Restaurante Bom Prato"
                required
                onChange={handleNameChange}
                className={inputClass}
                autoFocus
              />
              {state?.fieldErrors?.name && (
                <p className="text-sm text-red-600 mt-1">{state.fieldErrors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Personalizada <span className="text-red-500">*</span>
              </label>
              <input
                ref={slugRef}
                type="text"
                name="slug"
                placeholder="gerado-automaticamente"
                required
                onFocus={(e) => (e.currentTarget.dataset.touched = "true")}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-1">Gerado automaticamente pelo nome (máx. 50 caracteres)</p>
              {state?.fieldErrors?.slug && (
                <p className="text-sm text-red-600 mt-1">{state.fieldErrors.slug}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                placeholder="Descreva seu restaurante..."
                required
                rows={3}
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
              {state?.fieldErrors?.description && (
                <p className="text-sm text-red-600 mt-1">{state.fieldErrors.description}</p>
              )}
            </div>

            {/* Imagens */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL da Logo</label>
                <input type="url" name="avatarImageUrl" placeholder="https://..." className={inputClass} />
                {state?.fieldErrors?.avatarImageUrl && (
                  <p className="text-sm text-red-600 mt-1">{state.fieldErrors.avatarImageUrl}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL da Capa</label>
                <input type="url" name="coverImageUrl" placeholder="https://..." className={inputClass} />
                {state?.fieldErrors?.coverImageUrl && (
                  <p className="text-sm text-red-600 mt-1">{state.fieldErrors.coverImageUrl}</p>
                )}
              </div>
            </div>

            {/* Botão */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/restaurantes-cadastrados"
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition text-center"
              >
                Ver Restaurantes
              </Link>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 bg-[#00437A] hover:bg-[#005DA4] disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {pending ? "Cadastrando..." : "Cadastrar Restaurante"}
              </button>
            </div>
          </form>

          {/* Erros de validação */}
          {state?.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-700 mb-2">Erros encontrados:</p>
              {Object.entries(state.fieldErrors).map(([key, value]) => (
                <p key={key} className="text-sm text-red-600">
                  • {Array.isArray(value) ? value.join(", ") : String(value)}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
