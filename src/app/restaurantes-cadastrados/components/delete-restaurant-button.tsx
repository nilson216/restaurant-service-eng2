"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { deleteRestaurant } from "../actions";

interface DeleteRestaurantButtonProps {
  restaurantId: string;
  restaurantName: string;
}

const DeleteRestaurantButton = ({
  restaurantId,
  restaurantName,
}: DeleteRestaurantButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeleteRestaurant = () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o restaurante \"${restaurantName}\"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRestaurant(restaurantId);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível excluir o restaurante.");
        return;
      }

      toast.success("Restaurante excluído com sucesso.");
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDeleteRestaurant}
      disabled={isPending}
      className="col-span-2 rounded-xl"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {isPending ? "Excluindo..." : "Excluir"}
    </Button>
  );
};

export default DeleteRestaurantButton;