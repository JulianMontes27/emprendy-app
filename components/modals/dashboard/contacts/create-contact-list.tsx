"use client";

import { useState } from "react";
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
import { Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useModalStore from "@/hooks/use-store-modal";

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
  const { isOpen, onClose, modalType, data } = useModalStore();

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

  // Filter contacts based on search query
  const filteredContacts = data.contacts?.filter((contact: any) =>
    `${contact.firstName} ${contact.lastName} ${contact.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleCreateList = async (formValues: ListFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Creating list with:", formValues);
      // Reset form and close modal
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create list:", error);
      // TODO: Add error handling (e.g., toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen && modalType === "create-contact-list"}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crea una lista de contactos</DialogTitle>
          <DialogDescription>
            Crea una nueva lista para organizar tus contactos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreateList)} className="space-y-6">
          {/* List Name */}
          <div>
            <Label htmlFor="name">Nombre de la Lista</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Escribe el nombre de tu lista"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* List Description */}
          <div>
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descripción de la lista"
              disabled={isSubmitting}
            />
          </div>

          {/* Contact Selection */}
          <div>
            <Label>Selecciona Contactos</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar contactos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contact List */}
            <div className="mt-4 max-h-64 overflow-y-auto border rounded-lg p-2">
              {filteredContacts?.length ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
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
                    />
                    <label
                      htmlFor={contact.id}
                      className="flex-1 text-sm font-medium leading-none"
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Lista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
