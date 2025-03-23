"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Loader2,
  Filter,
  X,
  Users,
  Tag,
  Building,
  MapPin,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useModalStore from "@/hooks/use-store-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Zod schema for list creation
const listSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre de la lista debe tener al menos 2 caracteres",
  }),
  description: z.string().optional(),
  contacts: z.array(z.string()).min(1, "Selecciona al menos un contacto"),
});

// Type inference from Zod schema
type ListFormData = z.infer<typeof listSchema>;

export function CreateListModal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    industry: string | null;
    companySize: string | null;
    location: string | null;
    tags: string[];
  }>({
    industry: null,
    companySize: null,
    location: null,
    tags: [],
  });
  const { isOpen, onClose, modalType, data } = useModalStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ListFormData>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: "",
      description: "",
      contacts: [],
    },
  });

  const selectedContacts = watch("contacts");

  // Filter contacts based on search query and filters
  const filteredContacts = data.contacts?.filter((contact: any) => {
    const matchesSearch =
      `${contact.firstName} ${contact.lastName} ${contact.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesIndustry =
      !filters.industry || contact.industry === filters.industry;
    const matchesCompanySize =
      !filters.companySize || contact.companySize === filters.companySize;
    const matchesLocation =
      !filters.location || contact.location === filters.location;
    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.every((tag) => contact.tags?.includes(tag));

    return (
      matchesSearch &&
      matchesIndustry &&
      matchesCompanySize &&
      matchesLocation &&
      matchesTags
    );
  });

  const handleCreateList = async (formValues: ListFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Creating list with:", formValues);
      await axios.post("/api/contact-list", formValues);
      // Reset form and close modal
      reset();

      onClose();
      router.refresh();
    } catch (error) {
      console.error("Failed to create list:", error);
      // TODO: Add error handling (e.g., toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (key: string, value: string | string[] | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      industry: null,
      companySize: null,
      location: null,
      tags: [],
    });
  };

  const selectedContactsCount = selectedContacts.length;
  const totalContactsCount = data.contacts?.length || 0;

  return (
    <Dialog
      open={isOpen && modalType === "create-contact-list"}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-2xl p-0 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 bg-slate-50 border-b dark:bg-slate-900 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center dark:text-white">
            <Users className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Crear lista de contactos
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Organiza tus contactos en listas para una mejor gestión de campañas.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleCreateList)}
          className="p-6 space-y-6 bg-white dark:bg-slate-900"
        >
          {/* List Name and Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Nombre de la Lista
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Clientes potenciales"
                disabled={isSubmitting}
                className="w-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
              />
              {errors.name && (
                <p className="text-rose-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Descripción (Opcional)
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Breve descripción sobre el propósito de esta lista"
                disabled={isSubmitting}
                className="w-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 min-h-24 dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-700" />

          {/* Filter Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 flex items-center dark:text-white">
                <Filter className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Filtros
              </h3>
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                size="sm"
                className="h-8 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Industry Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 flex items-center dark:text-slate-400">
                  <Building className="mr-1 h-3 w-3" />
                  Industria
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("industry", value)
                  }
                  value={filters.industry || ""}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Selecciona una industria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tecnología</SelectItem>
                    <SelectItem value="finance">Finanzas</SelectItem>
                    <SelectItem value="healthcare">Salud</SelectItem>
                    <SelectItem value="education">Educación</SelectItem>
                    {/* Add more industries as needed */}
                  </SelectContent>
                </Select>
              </div>

              {/* Company Size Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 flex items-center dark:text-slate-400">
                  <Users className="mr-1 h-3 w-3" />
                  Tamaño de la Empresa
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("companySize", value)
                  }
                  value={filters.companySize || ""}
                >
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700">
                    <SelectValue placeholder="Selecciona un tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeña</SelectItem>
                    <SelectItem value="medium">Mediana</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 flex items-center dark:text-slate-400">
                  <MapPin className="mr-1 h-3 w-3" />
                  Ubicación
                </Label>
                <Input
                  type="text"
                  placeholder="Filtrar por ubicación"
                  value={filters.location || ""}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-500 flex items-center dark:text-slate-400">
                  <Tag className="mr-1 h-3 w-3" />
                  Etiquetas
                </Label>
                <Input
                  type="text"
                  placeholder="Separadas por comas"
                  value={filters.tags.join(", ")}
                  onChange={(e) =>
                    handleFilterChange("tags", e.target.value.split(", "))
                  }
                  className="w-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-700" />

          {/* Contact Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-900 flex items-center dark:text-white">
                <Users className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Selecciona Contactos
              </Label>
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {selectedContactsCount} de {totalContactsCount} seleccionados
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar contactos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            {/* Contact List */}
            <div className="mt-2 max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              {filteredContacts?.length ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-3 hover:bg-slate-50 border-b border-slate-200 last:border-0 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <Checkbox
                      id={contact.id}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) => {
                        const newContacts = checked
                          ? [...selectedContacts, contact.id]
                          : selectedContacts.filter((id) => id !== contact.id);
                        setValue("contacts", newContacts);
                      }}
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
                    />
                    <label
                      htmlFor={contact.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {contact.email}
                        </span>
                      </div>
                      {contact.company && (
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {contact.company}
                          {contact.industry && (
                            <span> · {contact.industry}</span>
                          )}
                        </div>
                      )}
                    </label>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="mb-2 h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No se encontraron contactos.
                  </p>
                </div>
              )}
            </div>
            {errors.contacts && (
              <p className="text-rose-500 text-sm mt-1">
                {errors.contacts.message}
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="mt-6 flex justify-end gap-2">
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
                "Crear Lista"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
