"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef } from "react";

import { createRestaurant } from "./actions";

const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00437A]";

export default function CreateRestaurantPage() {
  const [state, formAction, pending] = useActionState(createRestaurant, undefined);
  const slugRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugRef.current || slugRef.current.dataset.touched === "true") return;
    const name = e.target.value;
    slugRef.current.value = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

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
              <p className="text-xs text-gray-500 mt-1">Gerado automaticamente pelo nome</p>
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
            </div>

            {/* Imagens */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL da Logo</label>
                <input type="url" name="avatarImageUrl" placeholder="https://..." className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL da Capa</label>
                <input type="url" name="coverImageUrl" placeholder="https://..." className={inputClass} />
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

          {/* Erros */}
          {state?.fieldErrors && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              {Object.entries(state.fieldErrors).map(([key, value]: any) => (
                <p key={key} className="text-sm text-red-600">
                  {value}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
