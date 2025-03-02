"use client";
import axios from "axios";
import useModalStore from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 carácteres").max(50),
  email: z.string().min(5, "El correo debe tener al menos 5 carácteres"),
  msg: z.string().min(5, "El mensaje debe tener al menos 5 carácteres"),
});

type ContactUsSchemaType = z.infer<typeof formSchema>;

export default function ContactUsFormProvider() {
  const { isOpen, onClose, modalType } = useModalStore();

  const form = useForm<ContactUsSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", msg: "", email: "" },
  });

  const onSubmit = async (data: ContactUsSchemaType) => {
    /* Send POST to the API server */
    await axios.post("/api/send", data).then(() => {
      toast.success(
        "Tu correo ha sido enviado. Pronto nos pondremos en contacto contigo.",
        {
          duration: 4000,
          position: "top-center",
          // Change colors of success/error/loading icon

          // Aria
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
        }
      );
    });
  };

  return (
    <Dialog open={isOpen && modalType === "contact"} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black sm:max-w-[450px] rounded-lg shadow-lg p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-green-900">
            Contáctanos
          </DialogTitle>
          <p className="text-gray-500 text-sm">
            Déjanos tu mensaje y te responderemos pronto
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Tu Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting}
                      placeholder="Ejemplo: Pedro Pérez"
                      className="bg-gray-100 border rounded-md px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Tu Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting}
                      placeholder="Escribe tu mensaje aquí..."
                      className="bg-gray-100 border rounded-md px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="msg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Mensaje</FormLabel>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting}
                      placeholder="Escribe tu mensaje aquí..."
                      className="bg-gray-100 border rounded-md px-3 py-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-green-700 text-white hover:bg-green-500 transition-all py-2 rounded-md font-medium"
            >
              Enviar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
