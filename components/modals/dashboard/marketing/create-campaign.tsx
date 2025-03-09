"use client";

import axios from "axios";
import { useState } from "react";
import useModalStore from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, LucideMailPlus, Send, Clock } from "lucide-react";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Form Schema for Validation
const formSchema = z.object({
  campaignName: z.string().min(1, "El nombre es obligatorio"),
  description: z
    .union([
      z.string().min(1, "La descripción debe ser mayor que un carácter"),
      z.literal(""),
    ])
    .optional(),
  contactList: z
    .union([z.string().min(1, "Escoge una lista de contactos"), z.literal("")])
    .optional(),
  template: z.string().min(1, "Plantilla obligatoria"),
  subject: z.union([z.string().min(1, "Rellenar"), z.literal("")]).optional(),
  emailBody: z.union([z.string().min(1, "Rellenar"), z.literal("")]).optional(),
  scheduleDate: z.date().optional(),
  isScheduled: z.boolean().default(false),
});

type CreateCampaignModalType = z.infer<typeof formSchema>;

export default function CreateCampaignModal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();

  const { isOpen, onClose, modalType, data } = useModalStore();

  const { contactLists, templates } = data;

  const form = useForm<CreateCampaignModalType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignName: "",
      description: "",
      contactList: "",
      template: "",
      subject: "",
      emailBody: "",
      scheduleDate: undefined,
      isScheduled: false,
    },
  });

  const onSubmit = async (values: CreateCampaignModalType) => {
    try {
      setIsSubmitting(true);
      // Send data to the backend
      await axios.post("/api/campaigns", values);
      toast.success("Campaña creada exitosamente");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const advanceTab = () => {
    // on re-renders, update the state of the activeTab
    if (activeTab === "details") {
      setActiveTab("audience");
    } else if (activeTab === "audience") {
      setActiveTab("content");
    } else if (activeTab === "content") {
      setActiveTab("schedule");
    }
  };
  // Check if the current tab is valid before advancing
  const isCurrentTabValid = () => {
    if (activeTab === "details") {
      return (
        !form.formState.errors.campaignName &&
        !form.formState.errors.description
      );
    } else if (activeTab === "audience") {
      return !form.formState.errors.contactList;
    } else if (activeTab === "content") {
      return (
        !form.formState.errors.template &&
        !form.formState.errors.subject &&
        !form.formState.errors.emailBody
      );
    }
    return true;
  };

  return (
    <Dialog
      open={isOpen && modalType === "create-campaign"}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-blue-600 to-purple-600">
          <DialogTitle className="text-center text-xl font-bold text-white flex items-center justify-center">
            <LucideMailPlus className="mr-2 h-5 w-5" />
            Crear Campaña
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 px-6 pt-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="audience">Audiencia</TabsTrigger>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-6 pb-6"
            >
              <TabsContent value="details" className="space-y-4 mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="campaignName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            <span className="font-bold">Nombre</span> de la
                            Campaña
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Por ejemplo, "Promoción de primavera 2025"'
                              className="bg-gray-50 focus-visible:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="font-medium">
                            Descripción (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Breve descripción sobre el objetivo de la campaña"
                              className="bg-gray-50 focus-visible:ring-blue-500 min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audience" className="space-y-4 mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="contactList"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Seleccionar lista de contactos{" "}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 focus-visible:ring-blue-500">
                                <SelectValue placeholder="Elegir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {contactLists?.length > 0 &&
                                contactLists.map((list) => (
                                  <SelectItem key={list.id} value={list.id}>
                                    {list.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Plantilla
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 focus-visible:ring-blue-500">
                                <SelectValue placeholder="Escoge una Plantilla" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates?.length > 0 ? (
                                templates?.map((template) => (
                                  <SelectItem
                                    key={template.id}
                                    value={template.id}
                                  >
                                    {template.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <></>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4" />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Línea de asunto (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              className="bg-gray-50 focus-visible:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emailBody"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="font-medium">
                            <span className="font-bold">Contenido</span> del
                            Email (puedes editar esto después)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Escribe aquí el contenido de tu correo electrónico o utiliza variables de plantilla."
                              rows={8}
                              className="bg-gray-50 focus-visible:ring-blue-500 min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4 mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="isScheduled"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Opciones de <span className="font-bold">Envío</span>{" "}
                          </FormLabel>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button
                              type="button"
                              variant={!field.value ? "default" : "outline"}
                              onClick={() => field.onChange(false)}
                              className={cn(
                                "flex-1 h-14",
                                !field.value
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "border-2"
                              )}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Enviar inmediatamente{" "}
                            </Button>
                            <Button
                              type="button"
                              variant={field.value ? "default" : "outline"}
                              onClick={() => field.onChange(true)}
                              className={cn(
                                "flex-1 h-14",
                                field.value
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "border-2"
                              )}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Agendar para después
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("isScheduled") && (
                      <FormField
                        control={form.control}
                        name="scheduleDate"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel className="font-medium">
                              Seleccione fecha y hora{" "}
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal border-2",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Elige una fecha</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Navigation and Submit Buttons */}
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (activeTab === "audience") setActiveTab("details");
                    else if (activeTab === "content") setActiveTab("audience");
                    else if (activeTab === "schedule") setActiveTab("content");
                  }}
                  className={cn(
                    "border-2",
                    activeTab === "details" && "invisible"
                  )}
                >
                  Anterior
                </Button>

                <button
                  type="button"
                  className="bg-blue-400 p-2 rounded-md text-white text-sm hover:bg-blue-300 transition-all"
                  onClick={() => {
                    if (activeTab === "schedule") {
                      onSubmit(form.getValues()); // Submit the form directly
                    } else {
                      advanceTab();
                    }
                  }}
                >
                  {activeTab === "schedule" ? "Crear campaña" : "Siguiente"}
                </button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
