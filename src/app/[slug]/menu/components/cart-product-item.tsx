import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format-currency";

import { CartContext, CartProduct } from "../contexts/cart";

interface CartItemProps {
  product: CartProduct;
}

const CartProductItem = ({ product }: CartItemProps) => {
  const { decreaseProductQuantity, increaseProductQuantity, removeProduct } =
    useContext(CartContext);
  return (
    <div className="grid w-full grid-cols-[auto,minmax(0,1fr),auto] items-center gap-3 pr-4">
      {/* ESQUERDA */}
      <div className="relative h-20 w-20 shrink-0 rounded-xl bg-gray-100">
        <Image src={product.imageUrl} alt={product.name} fill />
      </div>
      <div className="min-w-0 space-y-1 overflow-hidden">
        <p className="truncate text-xs">{product.name}</p>
        <p className="text-sm font-semibold">{formatCurrency(product.price)}</p>
        {/* QUANTIDADE */}
        <div className="flex items-center gap-1 text-center">
          <Button
            className="h-7 w-7 rounded-lg"
            variant="outline"
            onClick={() => decreaseProductQuantity(product.id)}
          >
            <ChevronLeftIcon />
          </Button>
          <p className="w-7 text-xs">{product.quantity}</p>
          <Button
            className="h-7 w-7 rounded-lg"
            variant="destructive"
            onClick={() => increaseProductQuantity(product.id)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      {/* BOTÃO DE DELETAR */}
      <Button
        className="h-7 w-7 shrink-0 rounded-lg"
        variant="outline"
        onClick={() => removeProduct(product.id)}
      >
        <TrashIcon />
      </Button>
    </div>
  );
};

export default CartProductItem;
