import Image from "next/image";
import Link from "next/link";
import { PlusIcon, UtensilsCrossed } from "lucide-react";

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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-700/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-400">
              Painel de gestão
            </p>
            <h1 className="text-4xl font-bold tracking-tight">
              Restaurantes
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {restaurants.length}{" "}
              {restaurants.length === 1 ? "restaurante cadastrado" : "restaurantes cadastrados"}
            </p>
          </div>

          <Link
            href="/cadastrar-restaurante"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
          >
            <PlusIcon size={16} />
            Novo Restaurante
          </Link>
        </div>

        {/* Empty state */}
        {restaurants.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-24 text-center backdrop-blur-md">
            <UtensilsCrossed size={48} className="mb-4 text-zinc-600" />
            <p className="text-lg font-semibold text-zinc-300">Nenhum restaurante cadastrado</p>
            <p className="mt-1 text-sm text-zinc-500">
              Clique em &ldquo;Novo Restaurante&rdquo; para começar.
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => {
            const cover =
              validUrl(r.coverImageUrl) ??
              "https://placehold.co/800x300/1a1a1a/444?text=Sem+Capa";
            const avatar =
              validUrl(r.avatarImageUrl) ??
              "https://placehold.co/100x100/1a1a1a/666?text=Logo";

            return (
              <div
                key={r.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10"
              >
                {/* Cover */}
                <div className="relative h-36 w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={cover}
                    alt={r.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/80 to-transparent" />
                </div>

                {/* Avatar + name */}
                <div className="relative -mt-7 flex items-end gap-3 px-5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-[#0f0f0f] bg-zinc-800 shadow-lg">
                    <Image src={avatar} alt={r.name} fill className="object-cover" />
                  </div>
                  <h2 className="mb-1 truncate text-base font-bold leading-tight">
                    {r.name}
                  </h2>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-4 p-5 pt-3">
                  <p className="line-clamp-2 text-sm text-zinc-400">
                    {r.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/5">
                    <Stat label="Produtos" value={r._count.products} />
                    <Stat label="Categorias" value={r._count.menuCategories} />
                    <Stat label="Pedidos" value={r._count.orders} />
                  </div>

                  {/* Slug pill */}
                  <p className="truncate rounded-lg bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-500">
                    /{r.slug}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/${r.slug}`}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-center text-sm font-medium text-zinc-300 transition hover:border-orange-500/40 hover:text-white"
                    >
                      Ver Cardápio
                    </Link>
                    <Link
                      href={`/restaurantes-cadastrados/${r.id}/editar`}
                      className="flex-1 rounded-xl bg-orange-500/10 py-2 text-center text-sm font-medium text-orange-400 transition hover:bg-orange-500/20"
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
      <span className="text-base font-bold text-white">{value}</span>
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}