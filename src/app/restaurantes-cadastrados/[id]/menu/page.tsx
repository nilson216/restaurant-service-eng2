import { ChevronLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import MenuManagement from "./components/menu-management";

interface MenuManagementPageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuManagementPage({
  params,
}: MenuManagementPageProps) {
  const { id } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: {
      menuCategories: {
        include: { products: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!restaurant) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Breadcrumbs / Back */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/restaurantes-cadastrados"
            className="flex items-center gap-1 transition hover:text-[#00437A]"
          >
            <ChevronLeftIcon size={16} />
            Restaurantes
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900">{restaurant.name}</span>
          <span>/</span>
          <span>Cardápio</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <Image
              src={restaurant.avatarImageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-sm text-gray-500">{restaurant.description}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <MenuManagement restaurant={restaurant} />
        </div>
      </div>
    </div>
  );
}
