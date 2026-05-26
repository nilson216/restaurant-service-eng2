"use client";

import { Prisma } from "@prisma/client";
import { ClockIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/helpers/format-currency";

import { deleteCategory } from "../actions/manage-menu";
import { CartContext } from "../contexts/cart";
import CartSheet from "./cart-sheet";
import ManageCategoryDialog from "./manage-category-dialog";
import Products from "./products";

interface RestaurantCategoriesProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true };
      };
    };
  }>;
}

type MenuCategoriesWithProducts = Prisma.MenuCategoryGetPayload<{
  include: { products: true };
}>;

const RestaurantCategories = ({ restaurant }: RestaurantCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] =
    useState<MenuCategoriesWithProducts>(restaurant.menuCategories[0]);

  // Atualiza a categoria selecionada se ela não existir mais (ex: foi excluída)
  // ou se a lista de categorias era vazia e agora tem itens
  if (selectedCategory && !restaurant.menuCategories.find(c => c.id === selectedCategory.id)) {
    setSelectedCategory(restaurant.menuCategories[0]);
  } else if (!selectedCategory && restaurant.menuCategories.length > 0) {
    setSelectedCategory(restaurant.menuCategories[0]);
  }
  const [isManageCategoryOpen, setIsManageCategoryOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<MenuCategoriesWithProducts | undefined>();

  const { products, total, toggleCart, totalQuantity } =
    useContext(CartContext);
  const handleCategoryClick = (category: MenuCategoriesWithProducts) => {
    setSelectedCategory(category);
  };
  const getCategoryButtonVariant = (category: MenuCategoriesWithProducts) => {
    return selectedCategory.id === category.id ? "default" : "secondary";
  };

  const handleAddCategory = () => {
    setCategoryToEdit(undefined);
    setIsManageCategoryOpen(true);
  };

  const handleEditCategory = () => {
    setCategoryToEdit(selectedCategory);
    setIsManageCategoryOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (confirm("Tem certeza que deseja excluir esta categoria? Todos os produtos vinculados também serão excluídos.")) {
      await deleteCategory(selectedCategory.id, restaurant.slug);
      // O revalidatePath cuidará da atualização
    }
  };

  return (
    <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-white pb-20">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Image
            src={restaurant.avatarImageUrl}
            alt={restaurant.name}
            height={45}
            width={45}
          />
          <div>
            <h2 className="text-lg font-semibold">{restaurant.name}</h2>
            <p className="text-xs opacity-55">{restaurant.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-green-500">
          <ClockIcon size={12} />
          <p>Aberto!</p>
        </div>
      </div>

      <div className="flex items-center px-5">
        <ScrollArea className="w-full">
          <div className="flex w-max space-x-4 p-4 pt-0">
            {restaurant.menuCategories.map((category) => (
              <Button
                onClick={() => handleCategoryClick(category)}
                key={category.id}
                variant={getCategoryButtonVariant(category)}
                size="sm"
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleAddCategory}
            >
              <PlusIcon size={16} />
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="flex items-center justify-between px-5 pt-2">
        <h3 className="font-semibold">{selectedCategory?.name}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleEditCategory}>
            <PencilIcon size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={handleDeleteCategory}>
            <TrashIcon size={16} />
          </Button>
        </div>
      </div>

      {selectedCategory && (
        <Products 
          products={selectedCategory.products} 
          restaurantId={restaurant.id}
          menuCategoryId={selectedCategory.id}
        />
      )}

      {products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex w-full items-center justify-between border-t bg-white px-5 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Total dos pedidos</p>
            <p className="text-sm font-semibold">
              {formatCurrency(total)}
              <span className="text-xs font-normal text-muted-foreground">
                / {totalQuantity} {totalQuantity > 1 ? "itens" : "item"}
              </span>
            </p>
          </div>
          <Button onClick={toggleCart}>Ver Carrinho</Button>
          <CartSheet />
        </div>
      )}

      <ManageCategoryDialog 
        open={isManageCategoryOpen} 
        onOpenChange={setIsManageCategoryOpen}
        restaurantId={restaurant.id}
        slug={restaurant.slug}
        category={categoryToEdit}
      />
    </div>
  );
};

export default RestaurantCategories;
