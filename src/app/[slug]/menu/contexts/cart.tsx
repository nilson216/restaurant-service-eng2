"use client";

import { useUser } from "@clerk/nextjs";
import { Product } from "@prisma/client";
import { useParams } from "next/navigation";
import { createContext, ReactNode, useCallback, useEffect, useState } from "react";

import * as cartActions from "../actions/cart";

export interface CartProduct
  extends Pick<Product, "id" | "name" | "price" | "imageUrl"> {
  quantity: number;
}

export interface ICartContext {
  isOpen: boolean;
  products: CartProduct[];
  total: number;
  totalQuantity: number;
  toggleCart: () => void;
  addProduct: (product: CartProduct) => Promise<void>;
  decreaseProductQuantity: (productId: string) => Promise<void>;
  increaseProductQuantity: (productId: string) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<ICartContext>({
  isOpen: false,
  total: 0,
  totalQuantity: 0,
  products: [],
  toggleCart: () => {},
  addProduct: async () => {},
  decreaseProductQuantity: async () => {},
  increaseProductQuantity: async () => {},
  removeProduct: async () => {},
  clearCart: async () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { slug } = useParams<{ slug: string }>();
  const { isLoaded, isSignedIn } = useUser();

  const fetchCart = useCallback(async () => {
    if (!slug || !isSignedIn) {
      setProducts([]);
      return;
    }
    try {
      const cart = await cartActions.getCart(slug);
      if (cart) {
        setProducts(
          cart.items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            quantity: item.quantity,
          })),
        );
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, [slug, isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchCart();
    }
  }, [fetchCart, isLoaded]);

  const total = products.reduce((acc, product) => {
    return acc + product.price * product.quantity;
  }, 0);

  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity;
  }, 0);

  const toggleCart = () => {
    setIsOpen((prev) => !prev);
  };

  const addProduct = async (product: CartProduct) => {
    if (!slug) return;
    
    // Optimistic update
    setProducts((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + product.quantity } : p
        );
      }
      return [...prev, product];
    });

    try {
      await cartActions.addToCart(product.id, product.quantity, slug);
      await fetchCart(); // Refresh from server
    } catch (error) {
      console.error("Failed to add product:", error);
      await fetchCart(); // Rollback on error
    }
  };

  const decreaseProductQuantity = async (productId: string) => {
    if (!slug) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.quantity === 1) return;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
      )
    );

    try {
      await cartActions.updateCartItemQuantity(productId, product.quantity - 1, slug);
      await fetchCart();
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
      await fetchCart();
    }
  };

  const increaseProductQuantity = async (productId: string) => {
    if (!slug) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
      )
    );

    try {
      await cartActions.updateCartItemQuantity(productId, product.quantity + 1, slug);
      await fetchCart();
    } catch (error) {
      console.error("Failed to increase quantity:", error);
      await fetchCart();
    }
  };

  const removeProduct = async (productId: string) => {
    if (!slug) return;

    // Optimistic update
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      await cartActions.removeFromCart(productId, slug);
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove product:", error);
      await fetchCart();
    }
  };

  const clearCart = async () => {
    if (!slug) return;

    setProducts([]);

    try {
      await cartActions.clearCart(slug);
      await fetchCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      await fetchCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        isOpen,
        products,
        toggleCart,
        addProduct,
        decreaseProductQuantity,
        increaseProductQuantity,
        removeProduct,
        clearCart,
        total,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
