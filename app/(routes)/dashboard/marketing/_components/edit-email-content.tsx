"use client";

import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Save, Pencil, FileText, Type } from "lucide-react";
import { useRouter } from "next/navigation";

// The format of the data the client must submit
const formSchema = z.object({
  subject: z
    .string()
    .min(2, {
      message: "El asunto debe tener al menos 2 caracteres",
    })
    .max(100, {
      message: "El asunto no puede tener más de 100 caracteres",
    }),
  emailBody: z
    .string()
    .min(10, {
      message: "El cuerpo del email debe tener al menos 10 caracteres",
    })
    .max(5000, {
      message: "El cuerpo del email no puede tener más de 5000 caracteres",
    }),
});

const EditEmailContent = ({ campaignData }: { campaignData: any }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: campaignData?.settings?.subject || "",
      emailBody: campaignData?.settings?.emailBody || "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // send request to mutate the server data and refresh the page to send a new request to the server for the updated server data (without re rendering client component)
      const response = await axios
        .post(`/api/campaigns/${campaignData.id}`, values)
        .then(() => {
          router.refresh();
        });
    } catch (error) {
      console.error("Error saving email content:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Mail className="h-5 w-5 text-primary" />
          Editar Contenido del Email
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="space-y-3 transition-all duration-200">
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Type className="h-4 w-4 text-primary" />
                    Asunto del Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input
                        placeholder="Ej: Novedades de nuestra empresa"
                        {...field}
                        className="pl-3 pr-10 py-6 text-base transition-all duration-200 border-border/60 focus-visible:border-primary/50 shadow-sm"
                      />
                      <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground/80">
                    El asunto es lo primero que verán tus destinatarios. Hazlo
                    atractivo y relevante.
                  </FormDescription>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            <FormField
              control={form.control}
              name="emailBody"
              render={({ field }) => (
                <FormItem className="space-y-3 transition-all duration-200">
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <FileText className="h-4 w-4 text-primary" />
                    Cuerpo del Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Textarea
                        placeholder="Escribe aquí el contenido de tu email..."
                        {...field}
                        className="min-h-[200px] p-4 text-base transition-all duration-200 border-border/60 focus-visible:border-primary/50 resize-y shadow-sm"
                      />
                      <div className="absolute right-3 top-3 bg-background/80 backdrop-blur-sm p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground/80">
                    Puedes usar texto plano o HTML para dar formato a tu
                    mensaje. Mantén tu mensaje claro y conciso.
                  </FormDescription>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <div className="h-4"></div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 py-4 px-6 bg-gray-50/50 dark:bg-gray-900/50 border-t">
        <Button variant="outline" type="button" className="gap-2">
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || !form.formState.isDirty}
          className="gap-2 min-w-[140px] relative overflow-hidden group"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              Guardar Cambios
            </>
          )}

          {/* Animated background effect on hover */}
          <span
            className="absolute inset-0 bg-gradient-to-r from-primary-600/0 via-primary-600/30 to-primary-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
            style={{
              backgroundSize: "200% 100%",
              backgroundPositionX: "-100%",
              animation: "shimmer 2s infinite",
            }}
          />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EditEmailContent;
