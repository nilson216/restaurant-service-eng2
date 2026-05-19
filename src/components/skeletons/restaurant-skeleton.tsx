/**
 * Componente skeleton para o card de restaurante
 * Exibido durante o carregamento
 */

export function RestaurantCardSkeleton() {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md animate-pulse">
      {/* Cover skeleton */}
      <div className="relative h-36 w-full bg-gray-200" />

      {/* Avatar + name skeleton */}
      <div className="relative -mt-7 flex items-end gap-3 px-5">
        <div className="relative h-14 w-14 shrink-0 rounded-xl border-2 border-white bg-gray-200" />
        <div className="flex-1">
          <div className="h-5 w-32 rounded bg-gray-200" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="flex flex-1 flex-col gap-4 p-5 pt-3">
        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-3/4 rounded bg-gray-200" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-xl border border-gray-200 bg-gray-50 p-2">
          <div className="flex flex-col items-center py-2">
            <div className="h-5 w-6 rounded bg-gray-200" />
            <div className="mt-1 h-2 w-10 rounded bg-gray-200" />
          </div>
          <div className="flex flex-col items-center py-2">
            <div className="h-5 w-6 rounded bg-gray-200" />
            <div className="mt-1 h-2 w-12 rounded bg-gray-200" />
          </div>
          <div className="flex flex-col items-center py-2">
            <div className="h-5 w-6 rounded bg-gray-200" />
            <div className="mt-1 h-2 w-8 rounded bg-gray-200" />
          </div>
        </div>

        {/* Slug pill skeleton */}
        <div className="h-7 w-24 rounded-lg bg-gray-200" />

        {/* Actions skeleton */}
        <div className="mt-auto flex gap-2">
          <div className="flex-1 h-9 rounded-xl bg-gray-200" />
          <div className="flex-1 h-9 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function RestaurantsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}
