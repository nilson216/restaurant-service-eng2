"use client";

import { PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { forwardRef, useActionState, useEffect, useRef, useState } from "react";

import { createRestaurant } from "./actions";

interface Category {
  tempId: string;
  name: string;
}

interface Product {
  tempId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryTempId: string;
}

export default function CreateRestaurantPage() {
  const [state, formAction, pending] = useActionState(
    createRestaurant,
    undefined
  );
  const nameRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([
    { tempId: crypto.randomUUID(), name: "" },
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      tempId: crypto.randomUUID(),
      name: "",
      price: 0,
      description: "",
      imageUrl: "",
      categoryTempId: categories[0].tempId,
    },
  ]);

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

  const addCategory = () => {
    setCategories([...categories, { tempId: crypto.randomUUID(), name: "" }]);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    const newCategories = [...categories];
    const removedCat = newCategories.splice(index, 1)[0];
    setCategories(newCategories);

    // Update products that were in this category to the first available category
    const remainingCatId = newCategories[0].tempId;
    setProducts(
      products.map((p) =>
        p.categoryTempId === removedCat.tempId
          ? { ...p, categoryTempId: remainingCatId }
          : p
      )
    );
  };

  const updateCategory = (index: number, name: string) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        tempId: crypto.randomUUID(),
        name: "",
        price: 0,
        description: "",
        imageUrl: "",
        categoryTempId: categories[0].tempId,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length <= 1) return;
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="relative w-full max-w-2xl animate-fade-in">
        {/* LOGO */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image
            src="/logo.png"
            alt="MEC Donalds"
            width={120}
            height={120}
            className="rounded-full shadow-lg"
          />
          <h1 className="text-xl font-bold tracking-tight text-[#00437A]">
            Univali Services
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Preencha as informações abaixo para adicionar um novo restaurante.
          </p>
        </div>

        <div className="rounded-2xl border-none bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Cadastrar Restaurante
          </h2>
          <form action={formAction} className="space-y-6">
            <input
              type="hidden"
              name="categories"
              value={JSON.stringify(categories)}
            />
            <input
              type="hidden"
              name="products"
              value={JSON.stringify(products)}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Informações Básicas
              </h3>
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Descrição <span className="text-[#00437A]">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Ex: O melhor prato feito da universidade!"
                  required
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#00437A]/60 focus:ring-2 focus:ring-[#00437A]/20"
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
            </div>

            {/* CATEGORIES SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Categorias <span className="text-[#00437A]">*</span>
                </h3>
                <button
                  type="button"
                  onClick={addCategory}
                  className="flex items-center gap-1 text-xs font-medium text-[#00437A] hover:underline"
                >
                  <PlusIcon size={14} /> Adicionar Categoria
                </button>
              </div>
              {categories.map((cat, index) => (
                <div key={cat.tempId} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field
                      id={`category-${index}`}
                      label={`Nome da Categoria ${index + 1}`}
                      placeholder="Ex: Bebidas"
                      value={cat.name}
                      onChange={(e) => updateCategory(index, e.target.value)}
                      required
                    />
                  </div>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="mb-1 rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <TrashIcon size={18} />
                    </button>
                  )}
                </div>
              ))}
              {state?.fieldErrors?.categories && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.categories}
                </p>
              )}
            </div>

            {/* PRODUCTS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Produtos <span className="text-[#00437A]">*</span>
                </h3>
                <button
                  type="button"
                  onClick={addProduct}
                  className="flex items-center gap-1 text-xs font-medium text-[#00437A] hover:underline"
                >
                  <PlusIcon size={14} /> Adicionar Produto
                </button>
              </div>
              <div className="grid gap-6">
                {products.map((prod, index) => (
                  <div
                    key={prod.tempId}
                    className="relative rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Produto #{index + 1}
                      </span>
                      {products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        id={`prod-name-${index}`}
                        label="Nome"
                        placeholder="Ex: Coca-Cola"
                        value={prod.name}
                        onChange={(e) =>
                          updateProduct(index, "name", e.target.value)
                        }
                        required
                      />
                      <Field
                        id={`prod-price-${index}`}
                        label="Preço (R$)"
                        type="number"
                        placeholder="0,00"
                        value={prod.price || ""}
                        onChange={(e) =>
                          updateProduct(index, "price", Number(e.target.value))
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Categoria <span className="text-[#00437A]">*</span>
                        </label>
                        <select
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#00437A]/60 focus:ring-2 focus:ring-[#00437A]/20"
                          value={prod.categoryTempId}
                          onChange={(e) =>
                            updateProduct(index, "categoryTempId", e.target.value)
                          }
                          required
                        >
                          {categories.map((cat) => (
                            <option key={cat.tempId} value={cat.tempId}>
                              {cat.name || `Categoria sem nome (${cat.tempId.substring(0,4)})`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Field
                        id={`prod-img-${index}`}
                        label="URL da Imagem"
                        placeholder="https://..."
                        value={prod.imageUrl}
                        onChange={(e) =>
                          updateProduct(index, "imageUrl", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Descrição
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Breve descrição do produto..."
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#00437A]/60 focus:ring-2 focus:ring-[#00437A]/20"
                        value={prod.description}
                        onChange={(e) =>
                          updateProduct(index, "description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              {state?.fieldErrors?.products && (
                <p className="text-xs text-red-500">
                  {state.fieldErrors.products}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4" />

            <button
              type="submit"
              disabled={pending}
              className="relative w-full overflow-hidden rounded-xl bg-[#00437A] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#005DA4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner /> Cadastrando...
                </span>
              ) : (
                "Finalizar Cadastro de Restaurante"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Campos marcados com <span className="text-[#00437A]">*</span> são
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
  name?: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, name, label, placeholder, hint, required, type = "text", value, onChange, onFocus },
  ref
) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#00437A]">*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        name={name || id}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#00437A]/60 focus:ring-2 focus:ring-[#00437A]/20"
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
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
