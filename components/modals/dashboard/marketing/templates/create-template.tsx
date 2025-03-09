"use client";

import axios from "axios";
import { useState } from "react";
import useModalStore from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Form Schema for Validation
const templateSchema = z.object({
  name: z.string().min(1, "El nombre de la plantilla es requerido."),
  subject: z.union([z.string().min(1, "Rellenar"), z.literal("")]).optional(),
  content: z.union([z.string().min(1, "Rellenar"), z.literal("")]).optional(),
  type: z.string().default("html"),
  category: z.string().default("cold_email"),
  isActive: z.boolean().default(true),
});

type CreateTemplateModalType = z.infer<typeof templateSchema>;

export default function CreateTemplateModal() {
  const { isOpen, onClose, modalType, data } = useModalStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTemplateModalType>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      type: "text",
      category: "cold_email",
      isActive: true,
    },
  });

  const onSubmit = async (values: CreateTemplateModalType) => {
    try {
      setIsSubmitting(true);
      // Send data to the backend
      await axios.post("/api/campaigns/templates", values);
      toast.success("Template created successfully!");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isModalOpen = isOpen && modalType === "create-template";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600">
          <DialogTitle className="text-center text-xl font-bold text-white flex items-center justify-center">
            Crea una plantilla para correos
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-6 pb-6"
          >
            <Card>
              <CardContent className="pt-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        <span className="font-bold">Nombre</span> de la
                        Plantilla
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Follow-Up Email"
                          className="bg-gray-50 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-medium">
                        Tema (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Follow-Up on Our Meeting"
                          className="bg-gray-50 focus-visible:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-medium">
                        Contenido (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your email content here..."
                          rows={8}
                          className="bg-gray-50 focus-visible:ring-blue-500 min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-medium">
                        Tipo (Opcional)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 focus-visible:ring-blue-500">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="plaintext">Texto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="font-medium">
                        Categoría (Opcional)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 focus-visible:ring-blue-500">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cold_email">Cold Email</SelectItem>
                          <SelectItem value="follow_up">Follow-Up</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Variables */}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Creando..." : "Crear Plantilla"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
