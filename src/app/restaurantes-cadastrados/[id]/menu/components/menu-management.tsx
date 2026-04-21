"use client";

import { Prisma } from "@prisma/client";
import { ChevronDownIcon, ChevronRightIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { deleteCategory, deleteProduct } from "../actions";
import CategoryDialog from "./category-dialog";
import ProductDialog from "./product-dialog";

interface MenuManagementProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true };
      };
    };
  }>;
}

export default function MenuManagement({ restaurant }: MenuManagementProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(restaurant.menuCategories.map((c) => [c.id, true]))
  );

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria e TODOS os seus produtos?")) {
      await deleteCategory(id, restaurant.id);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct(id, restaurant.id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Cardápio</h2>
        <div className="flex gap-2">
          <CategoryDialog restaurantId={restaurant.id} />
          <ProductDialog restaurantId={restaurant.id} categories={restaurant.menuCategories} />
        </div>
      </div>

      <div className="space-y-4">
        {restaurant.menuCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 py-3">
              <div className="flex items-center justify-between">
                <div 
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => toggleCategory(category.id)}
                >
                  {expandedCategories[category.id] ? (
                    <ChevronDownIcon size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRightIcon size={20} className="text-gray-400" />
                  )}
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {category.name}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({category.products.length} produtos)
                    </span>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <CategoryDialog restaurantId={restaurant.id} category={category} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2Icon size={18} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {expandedCategories[category.id] && (
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {category.products.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-400">
                      Nenhum produto nesta categoria.
                    </p>
                  ) : (
                    category.products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 transition hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{product.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                            <p className="text-sm font-semibold text-[#00437A] mt-1">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(product.price)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <ProductDialog 
                            restaurantId={restaurant.id} 
                            categories={restaurant.menuCategories} 
                            product={product} 
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2Icon size={18} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {restaurant.menuCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <p className="text-gray-500">Nenhuma categoria cadastrada ainda.</p>
            <p className="text-sm text-gray-400">Comece criando uma categoria para o seu cardápio.</p>
          </div>
        )}
      </div>
    </div>
  );
}
