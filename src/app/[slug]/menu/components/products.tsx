"use client";

import { Product } from "@prisma/client";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";

import { deleteProduct } from "../actions/manage-menu";
import ManageProductDialog from "./manage-product-dialog";

interface ProductsProps {
  products: Product[];
  restaurantId: string;
  menuCategoryId: string;
}

const Products = ({ products, restaurantId, menuCategoryId }: ProductsProps) => {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const consumptionMethod = searchParams.get("consumptionMethod");

  const [isManageProductOpen, setIsManageProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>();

  const handleAddProduct = () => {
    setProductToEdit(undefined);
    setIsManageProductOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsManageProductOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct(productId, slug);
    }
  };

  return (
    <div className="space-y-3 px-5">
      <Button
        variant="outline"
        className="w-full gap-2 rounded-full border-dashed"
        onClick={handleAddProduct}
      >
        <PlusIcon size={16} />
        Adicionar Produto
      </Button>

      {products.map((product) => (
        <div key={product.id} className="group relative border-b py-3">
          <Link
            href={`/${slug}/menu/${product.id}?consumptionMethod=${consumptionMethod}`}
            className="flex items-center justify-between gap-10"
          >
            {/* ESQUERDA */}
            <div className="flex-1">
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
              <p className="pt-3 text-sm font-semibold">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* DIREITA */}
            <div className="relative min-h-[82px] min-w-[120px]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="rounded-lg object-contain"
              />
            </div>
          </Link>

          <div className="absolute right-0 top-3 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                handleEditProduct(product);
              }}
            >
              <PencilIcon size={14} />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProduct(product.id);
              }}
            >
              <TrashIcon size={14} />
            </Button>
          </div>
        </div>
      ))}

      <ManageProductDialog
        open={isManageProductOpen}
        onOpenChange={setIsManageProductOpen}
        restaurantId={restaurantId}
        menuCategoryId={menuCategoryId}
        slug={slug}
        product={productToEdit}
      />
    </div>
  );
};

export default Products;
