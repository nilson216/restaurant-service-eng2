"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RedirectHome() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (userId) {
      router.push(
        process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ||
          "/restaurantes-cadastrados",
      );
    } else {
      router.push("/login");
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 inline-block">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
        <p className="text-lg font-semibold text-gray-800">Carregando...</p>
      </div>
    </div>
  );
}
