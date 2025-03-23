"use client";

import axios from "axios";
import { useState } from "react";
import useModalStore from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarIcon,
  MailPlus,
  Send,
  Clock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
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
        <DialogHeader className="p-6 pb-2 bg-slate-50 border-b dark:bg-slate-900 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center dark:text-white">
            <MailPlus className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Crear Campaña
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 px-6 pt-4 bg-white dark:bg-slate-900">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-400"
            >
              Detalles
            </TabsTrigger>
            <TabsTrigger
              value="audience"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-400"
            >
              Audiencia
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-400"
            >
              Contenido
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/30 dark:data-[state=active]:text-indigo-400"
            >
              Agenda
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-6 pb-6 bg-white dark:bg-slate-900"
            >
              <TabsContent value="details" className="space-y-4 mt-0">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="campaignName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium">Nombre</span> de la
                            Campaña
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Por ejemplo, "Promoción de primavera 2025"'
                              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Descripción (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Breve descripción sobre el objetivo de la campaña"
                              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 min-h-24 dark:bg-slate-800 dark:border-slate-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audience" className="space-y-4 mt-0">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="contactList"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Seleccionar lista de contactos
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700">
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
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-0">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Plantilla
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700">
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
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4 bg-slate-200 dark:bg-slate-700" />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Línea de asunto (Opcional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emailBody"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium">Contenido</span> del
                            Email (puedes editar esto después)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Escribe aquí el contenido de tu correo electrónico o utiliza variables de plantilla."
                              rows={8}
                              className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 min-h-32 dark:bg-slate-800 dark:border-slate-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4 mt-0">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="isScheduled"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">
                            Opciones de{" "}
                            <span className="font-medium">Envío</span>
                          </FormLabel>
                          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                            <Button
                              type="button"
                              variant={!field.value ? "default" : "outline"}
                              onClick={() => field.onChange(false)}
                              className={cn(
                                "flex-1 h-14",
                                !field.value
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                  : "border-slate-200 dark:border-slate-700"
                              )}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Enviar inmediatamente
                            </Button>
                            <Button
                              type="button"
                              variant={field.value ? "default" : "outline"}
                              onClick={() => field.onChange(true)}
                              className={cn(
                                "flex-1 h-14",
                                field.value
                                  ? "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                  : "border-slate-200 dark:border-slate-700"
                              )}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Agendar para después
                            </Button>
                          </div>
                          <FormMessage className="text-rose-500" />
                        </FormItem>
                      )}
                    />

                    {form.watch("isScheduled") && (
                      <FormField
                        control={form.control}
                        name="scheduleDate"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel className="text-slate-700 dark:text-slate-300">
                              Seleccione fecha y hora
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-700",
                                      !field.value &&
                                        "text-slate-500 dark:text-slate-400"
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
                                  className="border-slate-200 dark:border-slate-700"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-rose-500" />
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
                    "border-slate-200 dark:border-slate-700",
                    activeTab === "details" && "invisible"
                  )}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  onClick={() => {
                    if (activeTab === "schedule") {
                      form.handleSubmit(onSubmit)();
                    } else {
                      advanceTab();
                    }
                  }}
                >
                  {activeTab === "schedule" ? (
                    isSubmitting ? (
                      <span className="flex items-center">
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
                        Creando...
                      </span>
                    ) : (
                      "Crear campaña"
                    )
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
