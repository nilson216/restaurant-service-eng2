
import { ChevronLeftIcon, ChevronsRightIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Button } from "@/components/ui/button";

import { CartContext, CartProduct } from "../contexts/cart"

interface CartItemProps {
    product: CartProduct;
}

const CartProductItem = ({product}: CartItemProps) => {
    const {decreaseCartProductQuantity, increaseCartProductQuantity, removeProduct} = useContext(CartContext)
    return (
    <div className="flex items-center justify-between">
        {/*Esquerda*/}
       <div className="flex items-center gap-3"> 
            <div className="relative h-20 w-20 bg-gray-100">
                <Image src={product.imageUrl} alt={product.name} fill></Image>
            </div>
             <div className="space-y-1">
                <p className="max-w-[90%] truncate text-ellipsis text-xs">{product.name}</p>
                <p className="text-sm font-semibold">{formatCurrency(product.price)}</p>
                {/*Quantidade*/}
                <div className="flex items-center gap-1">
                    <Button className="w-7 h-7 rounded-lg" variant="outline" onClick={() => decreaseCartProductQuantity(product.id)}>
                        <ChevronLeftIcon />
                    </Button>
                    <p className="w-8 text-xs">{product.quantity}</p>
                    <Button className="w-7 h-7 rounded-lg" variant="destructive" onClick={() => increaseCartProductQuantity(product.id)}>
                        <ChevronsRightIcon />
                    </Button>
                </div>
            </div>
       </div>
       {/*Botaode Deletar*/}
       <Button className="h-7 w-7 rounded-lg" variant="outline" onClick={() => removeProduct(product.id)}>
         <TrashIcon />
       </Button>
    </div>);
}
 
export default CartProductItem;