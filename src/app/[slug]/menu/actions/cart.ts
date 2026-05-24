"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

export const getCart = async (restaurantSlug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const cart = await db.cart.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId: restaurant.id,
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  return cart;
};

export const addToCart = async (
  productId: string,
  quantity: number,
  restaurantSlug: string,
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  let cart = await db.cart.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId: restaurant.id,
      },
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: {
        userId,
        restaurantId: restaurant.id,
      },
    });
  }

  const cartItem = await db.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (cartItem) {
    await db.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: cartItem.quantity + quantity },
    });
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  revalidatePath(`/${restaurantSlug}/menu`);
};

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number,
  restaurantSlug: string,
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const cart = await db.cart.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId: restaurant.id,
      },
    },
  });

  if (!cart) return;

  const cartItem = await db.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (!cartItem) return;

  if (quantity <= 0) {
    await db.cartItem.delete({
      where: { id: cartItem.id },
    });
  } else {
    await db.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });
  }

  revalidatePath(`/${restaurantSlug}/menu`);
};

export const removeFromCart = async (
  productId: string,
  restaurantSlug: string,
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const cart = await db.cart.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId: restaurant.id,
      },
    },
  });

  if (!cart) return;

  await db.cartItem.delete({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  revalidatePath(`/${restaurantSlug}/menu`);
};

export const clearCart = async (restaurantSlug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const restaurant = await db.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const cart = await db.cart.findUnique({
    where: {
      userId_restaurantId: {
        userId,
        restaurantId: restaurant.id,
      },
    },
  });

  if (!cart) return;

  await db.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  revalidatePath(`/${restaurantSlug}/menu`);
};
