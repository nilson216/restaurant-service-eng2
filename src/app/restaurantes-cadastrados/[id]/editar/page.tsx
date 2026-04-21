import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import RestaurantForm from "./components/restaurant-form";

interface EditRestaurantPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRestaurantPage({
  params,
}: EditRestaurantPageProps) {
  const { id } = await params;

  const restaurant = await db.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    return notFound();
  }

  return <RestaurantForm restaurant={restaurant} />;
}
