import { AlertCircle, ChevronLeft, ChevronRight,CirclePlus, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/prisma";
import { isValidUrl } from "@/lib/validators";

const RESTAURANTS_PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function RestaurantesCadastradosPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));

  type RestaurantWithCount = Awaited<
    ReturnType<typeof db.restaurant.findMany<{
      include: { _count: { select: { products: true; menuCategories: true; orders: true } } };
    }>>
  >;

  let restaurants: RestaurantWithCount = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    // Buscar total de restaurantes
    totalCount = await db.restaurant.count();

    // Buscar restaurantes da página atual
    restaurants = await db.restaurant.findMany({
      orderBy: { name: "asc" },
      skip: (currentPage - 1) * RESTAURANTS_PER_PAGE,
      take: RESTAURANTS_PER_PAGE,
      include: {
        _count: { select: { products: true, menuCategories: true, orders: true } },
      },
    });
  } catch (err) {
    console.error("[RestaurantesCadastradosPage]", err);
    error = "Erro ao carregar restaurantes. Tente novamente mais tarde.";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00437A] hover:bg-[#005DA4] text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / RESTAURANTS_PER_PAGE);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-row gap-4 sm:flex-row sm:items-center sm:justify-between ">
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
            className="rounded-lg pl-13 text-[#000000] hover:bg-gray-200 transition m"
            title="Novo Restaurante"
          >
            <CirclePlus size={32} />
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
            const cover = isValidUrl(r.coverImageUrl)
              ? r.coverImageUrl
              : "https://placehold.co/800x300/e5e7eb/9ca3af?text=Sem+Capa";
            const avatar = isValidUrl(r.avatarImageUrl)
              ? r.avatarImageUrl
              : "https://placehold.co/100x100/e5e7eb/9ca3af?text=Logo";

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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                </div>

                {/* Avatar + name */}
                <div className="relative -mt-7 flex items-end gap-3 px-5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-gray-100 shadow-lg">
                    <Image
                      src={avatar}
                      alt={r.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Link
              href={`/restaurantes-cadastrados?page=${currentPage - 1}`}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition ${
                hasPreviousPage
                  ? "border border-gray-200 text-gray-700 hover:bg-gray-100"
                  : "cursor-not-allowed border border-gray-100 text-gray-400"
              }`}
              style={{ pointerEvents: hasPreviousPage ? "auto" : "none" }}
            >
              <ChevronLeft size={18} />
              Anterior
            </Link>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isCurrentPage = page === currentPage;
                return (
                  <Link
                    key={page}
                    href={`/restaurantes-cadastrados?page=${page}`}
                    className={`h-9 w-9 rounded-lg font-medium transition ${
                      isCurrentPage
                        ? "bg-[#00437A] text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>

            <Link
              href={`/restaurantes-cadastrados?page=${currentPage + 1}`}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition ${
                hasNextPage
                  ? "border border-gray-200 text-gray-700 hover:bg-gray-100"
                  : "cursor-not-allowed border border-gray-100 text-gray-400"
              }`}
              style={{ pointerEvents: hasNextPage ? "auto" : "none" }}
            >
              Próximo
              <ChevronRight size={18} />
            </Link>
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Página {currentPage} de {totalPages} • Exibindo {restaurants.length} de {totalCount} restaurantes
          </p>
        )}
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
