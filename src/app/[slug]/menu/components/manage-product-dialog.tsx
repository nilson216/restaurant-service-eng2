"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@prisma/client";
import { Loader2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { createProduct, updateProduct } from "../actions/manage-menu";

const formSchema = z.object({
  name: z.string().trim().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().trim().min(5, {
    message: "A descrição deve ter pelo menos 5 caracteres.",
  }),
  price: z.coerce.number().min(0.01, {
    message: "O preço deve ser maior que zero.",
  }),
  imageUrl: z.string().url({
    message: "URL de imagem inválida.",
  }),
  ingredients: z.array(z.string()).min(1, {
    message: "Adicione pelo menos um ingrediente.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

interface ManageProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  menuCategoryId: string;
  slug: string;
  product?: Product;
}

const ManageProductDialog = ({
  open,
  onOpenChange,
  restaurantId,
  menuCategoryId,
  slug,
  product,
}: ManageProductDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      ingredients: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        ingredients: product.ingredients,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        ingredients: [],
      });
    }
  }, [product, form, open]);

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;
    const currentIngredients = form.getValues("ingredients");
    form.setValue("ingredients", [...currentIngredients, newIngredient.trim()]);
    setNewIngredient("");
  };

  const handleRemoveIngredient = (index: number) => {
    const currentIngredients = form.getValues("ingredients");
    form.setValue("ingredients", currentIngredients.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);
      if (product) {
        await updateProduct(product.id, slug, {
          ...data,
          menuCategoryId,
        });
      } else {
        await createProduct({
          ...data,
          restaurantId,
          menuCategoryId,
          slug,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{product ? "Editar Produto" : "Novo Produto"}</DrawerTitle>
          <DrawerDescription>
            {product 
              ? "Atualize as informações do produto abaixo." 
              : "Preencha os campos para adicionar um novo produto a esta categoria."}
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="overflow-y-auto px-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Big Mac" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Dois hambúrgueres, alface, queijo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel>Ingredientes</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Adicionar ingrediente..." 
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddIngredient} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {form.watch("ingredients").map((ingredient, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"
                    >
                      {ingredient}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <XIcon size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                {form.formState.errors.ingredients && (
                  <p className="text-xs font-medium text-destructive">
                    {form.formState.errors.ingredients.message}
                  </p>
                )}
              </div>

              <DrawerFooter className="px-0">
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2Icon className="animate-spin" />}
                  {product ? "Salvar Alterações" : "Criar Produto"}
                </Button>
                <DrawerClose asChild>
                  <Button className="w-full rounded-full" variant="outline">
                    Cancelar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default ManageProductDialog;
