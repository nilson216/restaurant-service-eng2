"use client";

import { useState } from "react";
import { PlusIcon, EditIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory } from "../actions";

interface CategoryDialogProps {
  restaurantId: string;
  category?: { id: string; name: string };
}

export default function CategoryDialog({ restaurantId, category }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (category) {
        await updateCategory(category.id, restaurantId, name);
      } else {
        await createCategory(restaurantId, name);
      }
      setOpen(false);
      if (!category) setName("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button variant="ghost" size="icon">
            <EditIcon size={18} />
          </Button>
        ) : (
          <Button variant="outline" className="gap-2 border-[#00437A] text-[#00437A] hover:bg-[#00437A]/10">
            <PlusIcon size={16} />
            Nova Categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Bebidas, Sobremesas..."
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#00437A] hover:bg-[#005DA4]"
            >
              {loading ? "Salvando..." : category ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
