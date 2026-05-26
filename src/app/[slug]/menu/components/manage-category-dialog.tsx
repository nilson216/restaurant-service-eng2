"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MenuCategory } from "@prisma/client";
import { Loader2Icon } from "lucide-react";
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

import { createCategory, updateCategory } from "../actions/manage-menu";

const formSchema = z.object({
  name: z.string().trim().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }).max(50, {
    message: "O nome não pode exceder 50 caracteres.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

interface ManageCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  slug: string;
  category?: MenuCategory;
}

const ManageCategoryDialog = ({
  open,
  onOpenChange,
  restaurantId,
  slug,
  category,
}: ManageCategoryDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name });
    } else {
      form.reset({ name: "" });
    }
  }, [category, form, open]);

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);
      if (category) {
        await updateCategory(category.id, slug, data.name);
      } else {
        await createCategory(restaurantId, slug, data.name);
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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DrawerTitle>
          <DrawerDescription>
            {category 
              ? "Altere o nome da categoria abaixo." 
              : "Insira o nome da nova categoria para o cardápio."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bebidas, Sobremesas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DrawerFooter className="px-0">
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2Icon className="animate-spin" />}
                  {category ? "Salvar Alterações" : "Criar Categoria"}
                </Button>
                <DrawerClose asChild>
                  <Button className="w-full rounded-full" variant="outline">
                    Cancelar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ManageCategoryDialog;
