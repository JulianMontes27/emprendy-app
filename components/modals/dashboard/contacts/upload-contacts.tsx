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
import { Search, Loader2, Filter, X, Router } from "lucide-react";
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
import { db } from "@/db";

// Zod schema for list creation
const listSchema = z.object({
  name: z
    .string()
    .min(2, { message: "List name must be at least 2 characters" }),
  description: z.string().optional(),
  contacts: z.array(z.string()).min(1, "Select at least one contact"),
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
      filters.tags.every((tag) => contact.tags.includes(tag));

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

  return (
    <Dialog
      open={isOpen && modalType === "create-contact-list"}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-2xl p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Crea una lista de contactos
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Organiza tus contactos en listas para una mejor gestión.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreateList)} className="space-y-6">
          {/* List Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre de la Lista
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Escribe el nombre de tu lista"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* List Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Descripción (Opcional)
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descripción de la lista"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Industry Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Industria
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("industry", value)
                  }
                  value={filters.industry || ""}
                >
                  <SelectTrigger className="w-full">
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
                <Label className="text-sm font-medium text-gray-700">
                  Tamaño de la Empresa
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("companySize", value)
                  }
                  value={filters.companySize || ""}
                >
                  <SelectTrigger className="w-full">
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
                <Label className="text-sm font-medium text-gray-700">
                  Ubicación
                </Label>
                <Input
                  type="text"
                  placeholder="Filtrar por ubicación"
                  value={filters.location || ""}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Etiquetas
                </Label>
                <Input
                  type="text"
                  placeholder="Filtrar por etiquetas"
                  value={filters.tags.join(", ")}
                  onChange={(e) =>
                    handleFilterChange("tags", e.target.value.split(", "))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Selecciona Contactos
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar contactos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Contact List */}
            <div className="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
              {filteredContacts?.length ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={contact.id}
                      className="flex-1 text-sm font-medium leading-none text-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <span>
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span className="text-gray-500">({contact.email})</span>
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm p-2">No contacts found.</p>
              )}
            </div>
            {errors.contacts && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contacts.message}
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
