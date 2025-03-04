"use client";

import { useState } from "react";
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
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  import_type: z.string(),
});

type ImportContactsModalType = z.infer<typeof formSchema>;

export default function ImportContactsModal() {
  const { isOpen, onClose, modalType } = useModalStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { import_type: "" },
  });

  const onSubmit = async (data: ImportContactsModalType) => {
    router.push(`/dashboard/contacts/${data.import_type}`);
    onClose();
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    form.setValue("import_type", value);
  };

  const importOptions = [
    {
      id: "excel",
      title: "Excel",
      icon: "📊",
    },
    {
      id: "google-sheets",
      title: "Google Sheets",
      icon: "📈",
    },
    {
      id: "manual",
      title: "Manual",
      icon: "✏️",
    },
  ];

  const isModalOpen = isOpen && modalType === "import-contacts";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Importa data a Emprendy
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="import_type"
              render={({ field }) => (
                <FormItem>
                  <div className="text-center text-sm text-gray-500 mb-4">
                    Selecciona el método de importación
                  </div>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-3">
                      {importOptions.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => handleOptionSelect(option.id)}
                          className={`
                            flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${
                              selectedOption === option.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }
                          `}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="font-medium text-sm">
                            {option.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={!selectedOption}
                className="w-full sm:w-auto px-8"
              >
                Continuar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
