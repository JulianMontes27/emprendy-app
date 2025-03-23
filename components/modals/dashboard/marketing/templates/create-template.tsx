"use client";

import axios from "axios";
import { useState } from "react";
import useModalStore from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FileText, Mail, Tag, Code, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
      toast.success("Plantilla creada exitosamente");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Ocurrió un error. Por favor intenta de nuevo.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isModalOpen = isOpen && modalType === "create-template";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 bg-slate-50 border-b dark:bg-slate-900 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center dark:text-white">
            <FileText className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Crear plantilla de email
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Crea una plantilla para usar en tus campañas de email marketing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6 bg-white dark:bg-slate-900"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Información básica
                </h3>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nombre de la plantilla
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Seguimiento de reunión"
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-rose-500" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Tipo de contenido
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="html">
                            <div className="flex items-center">
                              <Code className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span>HTML</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="plaintext">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Texto plano</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                        HTML permite formatear el texto con estilos.
                      </FormDescription>
                      <FormMessage className="text-rose-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Categoría
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cold_email">
                            <div className="flex items-center">
                              <Tag className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Email frío</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="follow_up">
                            <div className="flex items-center">
                              <Tag className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Seguimiento</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="newsletter">
                            <div className="flex items-center">
                              <Tag className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              <span>Newsletter</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Ayuda a organizar tus plantillas.
                      </FormDescription>
                      <FormMessage className="text-rose-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700" />

            {/* Email Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                    Contenido del email
                  </h3>
                </div>
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                >
                  Variables disponibles
                </Badge>
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Asunto del email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Seguimiento de nuestra reunión"
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Puedes usar variables como {"{firstName}"} para
                      personalizar.
                    </FormDescription>
                    <FormMessage className="text-rose-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Contenido del email
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escribe el contenido de tu email aquí..."
                        rows={8}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 min-h-32 dark:bg-slate-800 dark:border-slate-700"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Variables disponibles: {"{firstName}"}, {"{lastName}"},{" "}
                      {"{company}"}, etc.
                    </FormDescription>
                    <FormMessage className="text-rose-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <DialogFooter className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Plantilla"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
