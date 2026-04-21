import { PlusIcon, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/prisma";

function validUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const p = new URL(url);
    return ["http:", "https:"].includes(p.protocol) ? url : null;
  } catch {
    return null;
  }
}

export default async function RestaurantesCadastradosPage() {
  const restaurants = await db.restaurant.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true, menuCategories: true, orders: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#00437A]">
              Painel de gestão
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Restaurantes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {restaurants.length}{" "}
              {restaurants.length === 1 ? "restaurante cadastrado" : "restaurantes cadastrados"}
            </p>
          </div>

          <Link
            href="/cadastrar-restaurante"
            className="flex items-center gap-2 rounded-xl bg-[#00437A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#005DA4]"
          >
            <PlusIcon size={16} />
            Novo Restaurante
          </Link>
        </div>

        {/* Empty state */}
        {restaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-24 text-center shadow-sm">
            <UtensilsCrossed size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">Nenhum restaurante cadastrado</p>
            <p className="mt-1 text-sm text-gray-400">
              Clique em &ldquo;Novo Restaurante&rdquo; para começar.
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => {
            const cover =
              validUrl(r.coverImageUrl) ??
              "https://placehold.co/800x300/e5e7eb/9ca3af?text=Sem+Capa";
            const avatar =
              validUrl(r.avatarImageUrl) ??
              "https://placehold.co/100x100/e5e7eb/9ca3af?text=Logo";

            return (
              <div
                key={r.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition hover:border-[#00437A]/30 hover:shadow-xl"
              >
                {/* Cover */}
                <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={cover}
                    alt={r.name}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                </div>

                {/* Avatar + name */}
                <div className="relative -mt-7 flex items-end gap-3 px-5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-gray-100 shadow-lg">
                    <Image src={avatar} alt={r.name} fill unoptimized className="object-cover" />
                  </div>
                  <h2 className="mb-1 truncate text-base font-bold leading-tight text-gray-900">
                    {r.name}
                  </h2>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-4 p-5 pt-3">
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {r.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-xl border border-gray-200 bg-gray-50">
                    <Stat label="Produtos" value={r._count.products} />
                    <Stat label="Categorias" value={r._count.menuCategories} />
                    <Stat label="Pedidos" value={r._count.orders} />
                  </div>

                  {/* Slug pill */}
                  <p className="truncate rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-xs text-gray-400">
                    /{r.slug}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/${r.slug}`}
                      className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-center text-sm font-medium text-gray-600 transition hover:border-[#00437A]/30 hover:text-gray-900"
                    >
                      Ver Cardápio
                    </Link>
                    <Link
                      href={`/restaurantes-cadastrados/${r.id}/editar`}
                      className="flex-1 rounded-xl bg-[#00437A]/10 py-2 text-center text-sm font-medium text-[#00437A] transition hover:bg-[#00437A]/20"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center py-2">
      <span className="text-base font-bold text-gray-900">{value}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}
