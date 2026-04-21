"use client";

import { useState } from "react";
import { PlusIcon, EditIcon, XIcon } from "lucide-react";
import { Product, MenuCategory } from "@prisma/client";

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
import { createProduct, updateProduct } from "../actions";

interface ProductDialogProps {
  restaurantId: string;
  categories: MenuCategory[];
  product?: Product;
}

export default function ProductDialog({
  restaurantId,
  categories,
  product,
}: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price.toString() || "",
    imageUrl: product?.imageUrl || "",
    menuCategoryId: product?.menuCategoryId || categories[0]?.id || "",
  });
  const [ingredients, setIngredients] = useState<string[]>(product?.ingredients || []);
  const [newIngredient, setNewIngredient] = useState("");

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        ingredients,
        restaurantId,
      };

      if (product) {
        await updateProduct(product.id, restaurantId, data);
      } else {
        await createProduct(data);
      }
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button variant="ghost" size="icon">
            <EditIcon size={18} />
          </Button>
        ) : (
          <Button className="gap-2 bg-[#00437A] hover:bg-[#005DA4]">
            <PlusIcon size={16} />
            Novo Produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cheeseburger"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <select
                required
                value={formData.menuCategoryId}
                onChange={(e) => setFormData({ ...formData, menuCategoryId: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço (R$)</label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ex: 29.90"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL da Imagem</label>
              <Input
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Descreva o produto..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ingredientes</label>
            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Adicionar ingrediente..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
              />
              <Button type="button" onClick={handleAddIngredient} variant="outline">
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-full bg-[#00437A]/10 px-3 py-1 text-xs font-medium text-[#00437A]"
                >
                  {ing}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(i)}
                    className="hover:text-red-500"
                  >
                    <XIcon size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00437A] hover:bg-[#005DA4] sm:w-auto"
            >
              {loading ? "Salvando..." : product ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
